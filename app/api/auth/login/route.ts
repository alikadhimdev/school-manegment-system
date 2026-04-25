// app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const body = await req.json();
        const { email, password } = body;

        // ✅ التحقق من المدخلات
        if (!email || !password) {
            return NextResponse.json(
                { error: "يرجى إدخال البريد الإلكتروني وكلمة المرور" },
                { status: 400 }
            );
        }

        // ✅ البحث عن المستخدم
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return NextResponse.json(
                { error: "البريد الإلكتروني غير مسجل" },
                { status: 401 }
            );
        }

        // ✅ التحقق من كلمة المرور
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return NextResponse.json(
                { error: "كلمة المرور خاطئة" },
                { status: 401 }
            );
        }

        // ✅ إنشاء JWT Token
        const token = await new SignJWT({
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            schoolId: user.schoolId?.toString() || null,
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("30d")
            .sign(secret);

        // ✅ إنشاء استجابة JSON مع الكوكي
        const response = NextResponse.json(
            {
                success: true,
                message: "تم تسجيل الدخول بنجاح",
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    schoolId: user.schoolId?.toString() || null,
                },
            },
            { status: 200 }
        );

        // ✅ ضبط الكوكي يدوياً (نفس اسم NextAuth)
        response.cookies.set("next-auth.session-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 30 * 24 * 60 * 60, // 30 يوم
        });

        return response;
    } catch (error: any) {
        console.error("❌ Login error:", error);
        return NextResponse.json(
            { error: "حدث خطأ أثناء تسجيل الدخول", message: error.message },
            { status: 500 }
        );
    }
}