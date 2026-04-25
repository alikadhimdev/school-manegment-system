// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// ✅ إنشاء معالج NextAuth
const handler = NextAuth(authOptions);

// ✅ التصدير الصحيح لـ App Router في NextAuth v4
export { handler as GET, handler as POST };