// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            // ✅ الاسم يجب أن يكون مطابقاً تماماً
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "admin@example.com" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                try {
                    await connectDB();

                    const { email, password } = credentials as { email: string; password: string };

                    if (!email || !password) {
                        throw new Error("يرجى إدخال البريد وكلمة المرور");
                    }

                    // ✅ ابحث عن المستخدم مع جلب حقل كلمة المرور المشفر
                    const user = await User.findOne({ email }).select("+password");

                    if (!user) {
                        throw new Error("البريد الإلكتروني غير مسجل");
                    }

                    const isMatch = await bcrypt.compare(password, user.password);

                    if (!isMatch) {
                        throw new Error("كلمة المرور خاطئة");
                    }

                    // ✅ أعد كائن المستخدم بدون كلمة المرور
                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        schoolId: user.schoolId?.toString() || null,
                    };
                } catch (error: any) {
                    // ✅ أعد الخطأ كنص ليظهر في الواجهة
                    throw new Error(error.message || "فشل في تسجيل الدخول");
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.schoolId = user.schoolId;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session?.user) {
                session.user.role = token.role;
                session.user.schoolId = token.schoolId;
                session.user.id = token.id;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 يوم
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === "development",
};