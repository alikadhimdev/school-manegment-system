import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { verifySchoolAdmin } from "../teachers/route";
import { Student } from "@/models/Student";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = await verifySchoolAdmin(req);
        if (!token || token.role !== "SCHOOL_ADMIN") {
            return NextResponse.json({ error: "غير مصرح لك. يجب أن تكون مدير مدرسة" }, { status: 403 });
        }

        const { name, rollNumber, grade } = await req.json();
        if (!name || !rollNumber || !grade) {
            return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
        }
        const newStudent = await Student.create({
            name, rollNumber, grade,
            schoolId: token.schoolId
        })

        return NextResponse.json(newStudent, { status: 201 });

    } catch (e) {
        if (e.code === 11000) {
            return NextResponse.json({ error: "رقم الجلوس هذا مسجل مسبقاً في مدرستك" }, { status: 400 });
        }
        return NextResponse.json({ error: e.message }, { status: 500 });

    }
}

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const token = await verifySchoolAdmin(req);
        if (!token || token.role !== "SCHOOL_ADMIN") {
            return NextResponse.json({ error: "غير مصرح لك. يجب أن تكون مدير مدرسة" }, { status: 403 });
        }

        const students = await Student.find({
            schoolId: token.schoolId
        }).sort({ grade: 1, name: 1 })

        return NextResponse.json(students);

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}