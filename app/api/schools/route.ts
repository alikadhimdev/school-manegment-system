import { connectDB } from "@/lib/mongodb";
import { School } from "@/models/School";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        await connectDB();

        const adminSecret = req.headers.get("x-admin-secret");

        if (adminSecret !== process.env.SUPER_ADMIN_SECRET) {
            return NextResponse.json(
                { error: 'غير مصرح لك بإنشاء مدرسة. هذه الصلاحية للمدير العام فقط.' },
                { status: 403 }
            )
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

        const adminSecret = req.headers.get('x-admin-secret');
        if (adminSecret !== process.env.SUPER_ADMIN_SECRET) {
            return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذه البيانات' }, { status: 403 });
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

