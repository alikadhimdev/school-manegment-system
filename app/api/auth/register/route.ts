import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        await connectDB();
        const { name, email, password, role, schoolId } = await req.json();

        const userExists = await User.findOne({ email });
        if (userExists) {
            return NextResponse.json({ error: 'المستخدم موجود بالفعل' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name, email, password: hashedPassword, schoolId: role === "SUPER_ADMIN" ? null : schoolId
        })

        return NextResponse.json({ message: 'تم تسجيل المستخدم بنجاح' }, { status: 201 });


    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}