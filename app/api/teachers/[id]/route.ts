import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { verifySchoolAdmin } from "../route";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {

    try {
        await connectDB();
        const token = await verifySchoolAdmin(req);
        if (!token || token.role !== "SCHOOL_ADMIN") {
            return NextResponse.json({ error: "غير مصرح لك. يجب أن تكون مدير مدرسة" }, { status: 403 });
        }

        const { id } = await params;
        const body = await req.json();
        const { name, email, password, subject, phone } = body;

        const teacher = await User.findOne({ _id: id, schoolId: token.schoolId, role: "TEACHER" });

        if (!teacher) {
            return NextResponse.json({ error: "المعلم غير موجود أو لا ينتمي لمدرستك" }, { status: 404 });
        }
        if (name) teacher.name = name;
        if (email) teacher.email = email;
        if (subject) teacher.subject = subject;
        if (phone) teacher.phone = phone;

        if (password) {
            teacher.password = await bcrypt.hash(password, 10);
        }

        await teacher.save();

        return NextResponse.json({ message: "تم تحديث بيانات المعلم بنجاح", teacher });




    } catch (error) {
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
        const deletedTeacher = await User.findOneAndDelete({ _id: id, schoolId: token.schoolId, role: "TEACHER" });

        if (!deletedTeacher) {
            return NextResponse.json({ error: "تعذر العثور على المعلم أو لا تملك صلاحية حذفه" }, { status: 404 });
        }
        return NextResponse.json({ message: "تم حذف المعلم بنجاح" });

    } catch (error) {
        return NextResponse.json({ error: "حدث خطأ أثناء الحذف" }, { status: 500 });
    }
}