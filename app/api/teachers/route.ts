import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "../schools/route";


export async function verifySchoolAdmin(req: NextRequest) {
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader) {
        return null;
    }

    const tokenValue = cookieHeader
        .split("; ")
        .find((c) => c.startsWith("next-auth.session-token="))
        ?.split("=")[1];

    if (!tokenValue) return null;
    const payload = await verifyToken(tokenValue);
    if (!payload) return null;

    if (payload.role !== "SCHOOL_ADMIN") return null;
    return payload;

}
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = await verifySchoolAdmin(req);
        if (!token || token.role !== "SCHOOL_ADMIN") {
            return NextResponse.json({ error: "غير مصرح لك. يجب أن تكون مدير مدرسة" }, { status: 403 });
        }

        const body = await req.json();
        const { name, email, password, subject, phone } = body;


        if (!name || !email || !password) {
            return NextResponse.json({ error: "الاسم والبريد وكلمة المرور مطلوبة" }, { status: 400 });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "البريد الإلكتروني مسجل مسبقاً" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newTeacher = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "TEACHER",
            schoolId: token.schoolId,
            subject,
            phone
        })

        return NextResponse.json({
            message: "تم إضافة المعلم بنجاح",
            teacher: {
                id: newTeacher._id,
                name: newTeacher.name,
                email: newTeacher.email,
                subject: newTeacher.subject
            }
        }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: "خطأ في السيرفر", details: error }, { status: 500 });
    }
}


export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const token = await verifySchoolAdmin(req);
        if (!token || token.role !== "SCHOOL_ADMIN") {
            return NextResponse.json({ error: "غير مصرح لك. يجب أن تكون مدير مدرسة" }, { status: 403 });
        }

        const teachers = await User.find({
            schoolId: token.schoolId,
            role: "TEACHER"
        }).select("-password").sort({ createdAt: -1 })

        return NextResponse.json(teachers);

    } catch (error) {
        return NextResponse.json({ error: "خطأ في جلب البيانات" }, { status: 500 });
    }
}