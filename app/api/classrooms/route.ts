import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { verifySchoolAdmin } from "../teachers/route";
import { Classroom } from "@/models/Classroom";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = await verifySchoolAdmin(req);
        if (!token || token.role != "SCHOOL_ADMIN") {
            return NextResponse.json({ error: "غير مصرح لك. يجب أن تكون مدير مدرسة" }, { status: 403 });
        }

        const { name, capacity, location } = await req.json();

        if (!name || !capacity) {
            return NextResponse.json({ error: "الاسم والسعة مطلوبان" }, { status: 400 });
        }

        const newClassroom = await Classroom.create({
            name, capacity, location, schoolId: token.schoolId
        })

        return NextResponse.json(
            { message: "تم انشاء الصف بنجاح", newClassroom }, { status: 201 });


    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const token = await verifySchoolAdmin(req);
        if (!token || token.role !== "SCHOOL_ADMIN") {
            return NextResponse.json({ error: "غير مصرح لك. يجب أن تكون مدير مدرسة" }, { status: 403 });
        }
        const classrooms = await Classroom.find({ schoolId: token.schoolId }).sort({ createdAt: -1 })
        return NextResponse.json(classrooms, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}