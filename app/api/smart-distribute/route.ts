import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { verifySchoolAdmin } from "../teachers/route";
import { Student } from "@/models/Student";
import { Classroom } from "@/models/Classroom";
import { ExamSession } from "@/models/ExamSession";
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = await verifySchoolAdmin(req);
        if (!token || token.role !== "SCHOOL_ADMIN") {
            return NextResponse.json({ error: "غير مصرح لك" }, { status: 403 });
        }

        const { grade, classroomIds } = await req.json();
        if (!grade || !classroomIds || !Array.isArray(classroomIds) || classroomIds.length === 0) {
            return NextResponse.json({
                error: "يجب اختيار الصف الدراسي وقاعة واحدة على الأقل"
            }, { status: 400 });
        }

        const [students, classrooms, teachers] = await Promise.all([
            (await Student.find({ schoolId: token.schoolId, grade }).sort({ rollNumber: 1 })),
            Classroom.find({ _id: { $in: classroomIds }, schoolId: token.schoolId }),
            User.find({ schoolId: token.schoolId, role: "TEACHER" })
        ])



        if (students.length === 0) {
            return NextResponse.json({ error: `لا يوجد طلاب مسجلين في صف: ${grade}` }, { status: 404 });
        }

        if (classrooms.length === 0) {
            return NextResponse.json({ error: "القاعات المختارة غير موجودة أو لا تنتمي لمدرستك" }, { status: 404 });
        }

        if (teachers.length === 0) {
            return NextResponse.json({ error: "لا يوجد معلمين مسجلين في المدرسة للقيام بالمراقبة" }, { status: 404 });
        }

        const shuffledTeachers = teachers.sort(() => Math.random() - 0.5)

        const totalCapacity = classrooms.reduce((sum, c) => sum + c.capacity, 0)
        if (totalCapacity < students.length) {
            return NextResponse.json({ error: "سعة القاعات المختارة أقل من عدد الطلاب" }, { status: 400 });
        }
        await ExamSession.deleteMany({ schoolId: token.schoolId, grade })
        const sessions = [];
        let studentPointer = 0;
        for (let i = 0; i < classrooms.length; i++) {
            const room = classrooms[i];
            const roomStudents = [];
            for (let s = 0; s < room.capacity; s++) {
                if (studentPointer >= students.length) break;
                roomStudents.push({
                    studentId: students[studentPointer]._id,
                    seatNumber: s + 1
                })
                studentPointer++
            }
            if (roomStudents.length > 0) {
                sessions.push({
                    schoolId: token.schoolId,
                    classroomId: room._id,
                    grade,
                    teacherId: shuffledTeachers[i % shuffledTeachers.length]._id,
                    students: roomStudents
                })
            }
        }

        await ExamSession.insertMany(sessions);

        return NextResponse.json({
            message: "تم التوزيع الذكي بنجاح",
            sessionsCount: sessions.length,
            totalStudents: students.length
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const token = await verifySchoolAdmin(req);
        if (!token || token.role !== "SCHOOL_ADMIN") {
            return NextResponse.json({ error: "غير مصرح لك" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url)
        const grade = searchParams.get("grade")
        const classroomId = searchParams.get("classroomId")
        const teacherId = searchParams.get("teacherId")

        let query: any = { schoolId: token.schoolId };
        if (grade) query.grade = grade;
        if (classroomId) query.classroomId = classroomId;
        if (teacherId) query.teacherId = teacherId

        const sessions = await ExamSession.find(query).populate("classroomId", "name location").populate("teacherId", "name subject").populate({
            path: "students.studentId",
            select: "name rollNumber"
        }).sort({ "classroomId.name": 1 })


        return NextResponse.json(sessions);


    } catch (error) {
        return NextResponse.json({ error: "خطأ في جلب النتائج", details: error.message }, { status: 500 });
    }
}