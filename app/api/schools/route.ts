import { connectDB } from "@/lib/mongodb";
import { School } from "@/models/School";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

async function verifySuperAdmin(req: NextRequest) {
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET
    })
    return token?.role === "SUPER_ADMIN" ? token : null;
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();


        const token = await verifySuperAdmin(req);
        if (!token) {
            return NextResponse.json(
                { error: "غير مصرح لك. هذه العملية تتطلب صلاحيات الأدمن الرئيسي" },
                { status: 403 }
            );
        }


        const body = await req.json();
        const { name, adminEmail, adminName, password } = body;

        if (!name || !adminEmail || !adminName || !password) {
            return NextResponse.json({ error: 'يرجى إكمال كافة بيانات المدرسة والمدير' }, { status: 400 });
        }



        const existSchool = await School.findOne({
            adminEmail
        });
        if (existSchool) {
            return NextResponse.json({ error: 'هذا البريد الإلكتروني مستخدم بالفعل كمدير' }, { status: 400 });
        }


        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = await User.create({
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: 'SCHOOL_ADMIN'
        });


        const newSchool = await School.create({
            name,
            adminEmail,
            adminId: newAdmin._id,
            subscriptionStatus: "trial"
        })

        await User.findByIdAndUpdate(newAdmin._id, { schoolId: newSchool._id })



        return NextResponse.json({
            message: 'تم إنشاء المدرسة وحساب المدير بنجاح',
            school: newSchool,
            admin: {
                id: newAdmin._id,
                name: newAdmin.name,
                email: newAdmin.email
            }
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'حدث خطأ أثناء التسجيل' }, { status: 500 });
    }
}

export async function GET(
    req: Request
) {
    try {
        await connectDB();


        const token = await verifySuperAdmin(req);
        if (!token) {
            return NextResponse.json(
                { error: "غير مصرح لك. هذه العملية تتطلب صلاحيات الأدمن الرئيسي" },
                { status: 403 }
            );
        }

        const schools = await School.find({})
            .populate("adminId", "name email")
            .sort({ createdAt: -1 });




        return NextResponse.json(schools);
    } catch (error) {
        return NextResponse.json(
            { error: 'تعذر جلب بيانات المدارس', message: error },
            { status: 500 }
        );
    }
}

