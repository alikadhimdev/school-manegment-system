// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                // ✅ التحقق من التوكن مباشرة
                try {
                    const token = credentials?.password; // نمرر التوكن كـ "password"

                    if (!token) return null;

                    const verified = await jwtVerify(token, secret);

                    return {
                        id: (verified.payload as any).id,
                        name: (verified.payload as any).name,
                        email: (verified.payload as any).email,
                        role: (verified.payload as any).role,
                        schoolId: (verified.payload as any).schoolId,
                    };
                } catch (error) {
                    console.error("Token verification failed:", error);
                    return null;
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
    session: { strategy: "jwt" },
    secret: process.env.NEXTAUTH_SECRET,
};