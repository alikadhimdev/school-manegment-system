import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Student } from "@/models/Student";
import * as XLSX from "xlsx";
import { verifySchoolAdmin } from "../../teachers/route";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = await verifySchoolAdmin(req);

        if (!token || token.role !== "SCHOOL_ADMIN") {
            return NextResponse.json({ error: "غير مصرح لك" }, { status: 403 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "يرجى رفع ملف إكسل" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]) as any[];

        if (rawData.length === 0) {
            return NextResponse.json({ error: "الملف فارغ" }, { status: 400 });
        }

        const grades = [...new Set(rawData.map(item => item.الصف || item.grade))].sort();
        const finalStudentsList: any[] = [];

        for (const grade of grades) {
            const lastStudentInGrade = await Student.findOne({
                schoolId: token.schoolId,
                grade: grade
            }).sort({ rollNumber: -1 }).collation({ locale: "en_US", numericOrdering: true });

            let currentRollNumber = lastStudentInGrade
                ? parseInt(lastStudentInGrade.rollNumber) + 1
                : 1;

            const studentsInGrade = rawData
                .filter(item => (item.الصف || item.grade) === grade)
                .map(item => ({
                    name: (item.الاسم || item.name).trim(),
                    grade: grade,
                    schoolId: token.schoolId
                }));

            studentsInGrade.sort((a, b) => a.name.localeCompare(b.name, 'ar'));

            const existingNamesInGrade = await Student.find({
                schoolId: token.schoolId,
                grade: grade
            }).distinct('name');

            for (const student of studentsInGrade) {

                if (!existingNamesInGrade.includes(student.name)) {
                    finalStudentsList.push({
                        ...student,
                        rollNumber: String(currentRollNumber)
                    });
                    currentRollNumber++;
                }
            }
        }


        if (finalStudentsList.length > 0) {
            const result = await Student.insertMany(finalStudentsList);
            return NextResponse.json({
                message: `تم إضافة ${result.length} طالب جديد بنجاح وتكملة تسلسل أرقام الجلوس.`,
                count: result.length
            }, { status: 201 });
        } else {
            return NextResponse.json({
                message: "جميع الطلاب في الملف موجودون مسبقاً، لم يتم إضافة سجلات جديدة."
            }, { status: 200 });
        }

    } catch (error: any) {
        console.error("Bulk Import Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}