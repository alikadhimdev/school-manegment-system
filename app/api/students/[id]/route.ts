import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { verifySchoolAdmin } from "../../teachers/route";
import { Student } from "@/models/Student";


export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const token = await verifySchoolAdmin(req);
        if (!token || token.role !== "SCHOOL_ADMIN") {
            return NextResponse.json({ error: "غير مصرح لك. يجب أن تكون مدير مدرسة" }, { status: 403 });
        }

        const { id } = await params;
        const student = await Student.findOne({ _id: id, schoolId: token.schoolId })

        if (!student) {
            return NextResponse.json({ error: "لم يتم العثور على الطالب" }, { status: 404 });
        }

        return NextResponse.json({ student }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: "حدث خطأ أثناء جلب معلومات الطالب" }, { status: 500 });

    }
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const token = await verifySchoolAdmin(req);
        if (!token || token.role !== "SCHOOL_ADMIN") {
            return NextResponse.json({ error: "غير مصرح لك. يجب أن تكون مدير مدرسة" }, { status: 403 });
        }

        const { id } = await params;
        const body = await req.json();
        const { name, rollNumber, grade } = body

        const editedStudent = await Student.findOne({ _id: id, schoolId: token.schoolId })
        if (name) editedStudent.name = name;
        if (rollNumber) editedStudent.rollNumber = rollNumber;
        if (grade) editedStudent.grade = grade;

        await editedStudent.save();

        return NextResponse.json({ message: "تم تحديث بيانات الطالب بنجاح", editedStudent }, { status: 200 })


    } catch (e) {
        if (e.code === 11000) {
            return NextResponse.json({ error: "رقم الجلوس هذا مسجل مسبقاً في مدرستك" }, { status: 400 });
        }
        return NextResponse.json({ error: "حدث خطأ أثناء التحديث" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const token = await verifySchoolAdmin(req);
        if (!token || token.role !== "SCHOOL_ADMIN") {
            return NextResponse.json({ error: "غير مصرح لك. يجب أن تكون مدير مدرسة" }, { status: 403 });
        }
        const { id } = await params;
        const deletedStudent = await Student.findOneAndDelete({ _id: id, schoolId: token.schoolId })

        if (!deletedStudent) {
            return NextResponse.json({ error: "تعذر العثور على الطالب أو لا تملك صلاحية حذفه" }, { status: 404 });

        }
        return NextResponse.json({ message: "تم حذف الطالب بنجاح" });

    } catch (error) {
        return NextResponse.json({ error: "حدث خطأ أثناء الحذف" }, { status: 500 });

    }
}