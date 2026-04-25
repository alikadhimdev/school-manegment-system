import { connectDB } from "@/lib/mongodb";
import { Hall } from "@/models/Hall";
import { NextResponse } from "next/server";

export async function POST(
    req: Request
) {
    try {
        await connectDB();
        const body = await req.json();
        const { schoolId, halls } = body;

        if (!schoolId || !halls || !Array.isArray(halls)) {
            return NextResponse.json({ error: 'بيانات القاعات غير مكتملة' }, { status: 400 });
        }

        const hallsWithSchoolId = halls.map(hall => ({ ...hall, schoolId }));
        const newHalls = await Hall.insertMany(hallsWithSchoolId);
        return NextResponse.json({ message: 'تم إضافة القاعات بنجاح', data: newHalls }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'فشل في إضافة القاعات' }, { status: 500 });
    }
}


export async function GET(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const schoolId = searchParams.get('schoolId');
        if (!schoolId) return NextResponse.json({ error: 'schoolId مطلوب' }, { status: 400 });
        const halls = await Hall.find({ schoolId })
        return NextResponse.json(halls);
    } catch (error) {
        return NextResponse.json({ error: 'خطأ في جلب القاعات' }, { status: 500 });
    }
}