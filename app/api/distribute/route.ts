import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { verifySchoolAdmin } from "../teachers/route";
import { Student } from "@/models/Student";
import { Classroom } from "@/models/Classroom";
import { Seating } from "@/models/Seating";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = await verifySchoolAdmin(req);
        if (!token || token.role !== "SCHOOL_ADMIN") {
            return NextResponse.json({ error: "غير مصرح لك" }, { status: 403 });
        }

        const { grade, classroomId } = await req.json();

        const students = await Student.find({ schoolId: token.schoolId, grade })
            .sort({ rollNumber: 1 })
            .collation({ locale: "en_US", numericOrdering: true })

        const classrooms = await Classroom.find({ _id: { $in: classroomId } });

        if (students.length === 0 || classrooms.length === 0) {
            return NextResponse.json({ students, error: "لا يوجد طلاب أو قاعات كافية" }, { status: 400 });
        }


        const totalCapacity = classrooms.reduce((sum, c) => sum + c.capacity, 0)
        if (totalCapacity < students.length) {
            return NextResponse.json({
                error: `السعة غير كافية. عدد الطلاب: ${students.length}, سعة القاعات: ${totalCapacity}`
            }, { status: 400 });
        }

        await Seating.deleteMany({ schoolId: token.schoolId, grade })

        let studentIndex = 0;
        const seatingRecords = [];

        for (const room of classrooms) {
            for (let i = 0; i < room.capacity; i++) {
                if (studentIndex >= students.length) break;

                seatingRecords.push({
                    studentId: students[studentIndex]._id,
                    classroomId: room._id,
                    schoolId: token.schoolId,
                    grade: grade,
                    seatNumber: i + 1
                })
                studentIndex++;
            }
            if (studentIndex >= students.length) break;
        }

        await Seating.insertMany(seatingRecords);
        return NextResponse.json({
            message: "تم توزيع الطلاب على القاعات بنجاح",
            distributedCount: seatingRecords.length
        });
    } catch (error) {
        return NextResponse.json({ message: "حدث خلل اثناء عملية توزيع الطلاب", error }, { status: 500 });
    }
}