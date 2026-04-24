import connectDB from "@/lib/mongodb";
import { School } from "@/models/School";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();
        const { name, adminEmail } = body;

        if (!name || !adminEmail) {
            return NextResponse.json({ error: 'اسم المدرسة والبريد الإلكتروني مطلوبان' },
                { status: 400 })
        }

        const newSchool = await School.create({
            name, adminEmail, subscriptionStatus: "trial"
        })

        return NextResponse.json(
            newSchool,
            {
                status: 201,
            }
        )
    } catch (error) {
        return NextResponse.json(
            { error: 'حدث خطأ أثناء إنشاء المدرسة', message: error },
            { status: 500 }
        )
    }
}

export async function GET() {
    try {
        await connectDB();
        const schools = await School.find({}).sort({ createdAt: -1 });
        return NextResponse.json(schools);
    } catch (error) {
        return NextResponse.json(
            { error: 'تعذر جلب بيانات المدارس' },
            { status: 500 }
        );
    }
}

