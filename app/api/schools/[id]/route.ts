import { connectDB } from "@/lib/mongodb";
import { School } from "@/models/School";
import { NextResponse } from "next/server";


export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const adminSecret = req.headers.get("x-admin-secret");
        if (adminSecret !== process.env.SUPER_ADMIN_SECRET) {
            return NextResponse.json({ error: 'غير مصرح لك' }, { status: 403 });
        }
        const { id } = await params;
        const school = await School.findById(id);

        return NextResponse.json(school);


    } catch (error) {

    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {

        await connectDB();

        const adminSecret = req.headers.get("x-admin-secret");
        if (adminSecret !== process.env.SUPER_ADMIN_SECRET) {
            return NextResponse.json({ error: 'غير مصرح لك' }, { status: 403 });
        }

        const body = await req.json();
        const { id } = await params;

        const updatedSchool = await School.findByIdAndUpdate(id, {
            $set: body
        }, {
            new: true
        })

        if (!updatedSchool) {
            return NextResponse.json({ error: 'المدرسة غير موجودة' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'تم تحديث بيانات المدرسة بنجاح',
            school: updatedSchool
        });
    } catch (error) {
        return NextResponse.json({ error: 'خطأ في تحديث البيانات' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const adminSecret = req.headers.get('x-admin-secret');
        if (adminSecret !== process.env.SUPER_ADMIN_SECRET) {
            return NextResponse.json({ error: 'غير مصرح لك' }, { status: 403 });
        }

        const { id } = await params;

        const deletedSchool = await School.findByIdAndDelete(id);

        if (!deletedSchool) {
            return NextResponse.json({ error: 'المدرسة غير موجودة' }, { status: 404 });
        }
        return NextResponse.json({ message: 'تم حذف المدرسة وكافة بياناتها بنجاح' });
    } catch (error) {
        return NextResponse.json({ error: 'خطأ في عملية الحذف' }, { status: 500 });
    }
}