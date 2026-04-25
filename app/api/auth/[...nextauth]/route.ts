import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                await connectDB();
                const user = await User.findOne({ email: credentials?.email });

                if (!user) throw new Error("البريد الإلكتروني غير مسجل");

                const isPasswordCorrect = await bcrypt.compare(credentials!.password, user.password)
                if (!isPasswordCorrect) throw new Error("كلمة المرور خاطئة");

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    schoolId: user.schoolId?.toString() || null,
                }


            }
        })
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.role = user.role;
                token.schoolId = user.schoolId;
                token.id = user.id;
            }

            return token;
        },
        async session({ session, token }: any) {
            if (token) {
                session.user.role = token.role;
                session.user.schoolId = token.schoolId;
                session.user.id = token.id;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login"
    },
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET,
}
)


export { handler as GET, handler as POST };