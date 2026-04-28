import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { verifySchoolAdmin } from "../teachers/route";
import { Seating } from "@/models/Seating";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const token = await verifySchoolAdmin(req);
        if (!token || token.role !== "SCHOOL_ADMIN") {
            return NextResponse.json({
                message: "غير مصرح لك"
            }
                , { status: 403 }

            )
        }

        const { searchParams } = new URL(req.url);
        const classroomId = searchParams.get("classroomId");
        const grade = searchParams.get("grade");


        let query: any = { schoolId: token.schoolId };

        if (classroomId) query.classroomId = classroomId;
        if (grade) query.grade = grade;

        const results = await Seating.find(query)
            .populate("studentId", "name,rollNumber grade")
            .populate("classroomId", "name location")
            .sort({ classroomId: 1, seatNumber: 1 });

        return NextResponse.json(results);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}