import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { verifySchoolAdmin } from "../../teachers/route";
import { Classroom } from "@/models/Classroom";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const token = await verifySchoolAdmin(req);
        if (!token || token.role !== "SCHOOL_ADMIN") {
            return NextResponse.json({ error: "غير مصرح لك. يجب أن تكون مدير مدرسة" }, { status: 403 });
        }

        const { id } = await params
        const classroom = await Classroom.findOne({ _id: id })
        if (!classroom) {
            return NextResponse.json({
                message: "لم يتم العثور على الصف المطلوب"
            })
        }
        return NextResponse.json(classroom);
    } catch (error) {

    }
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const token = await verifySchoolAdmin(req);
        if (!token || token.role !== "SCHOOL_ADMIN") {
            return NextResponse.json({ error: "غير مصرح لك. يجب أن تكون مدير مدرسة" }, { status: 403 });
        }
        const { id } = await params;
        const body = await req.json();
        const updatedClassroom = await Classroom.findOneAndUpdate({ _id: id, schoolId: token.schoolId }, {
            $set: body
        }, { new: true, runValidators: true })
        if (!updatedClassroom) {
            return NextResponse.json({ error: "القاعة غير موجودة أو لا تملك صلاحية تعديلها" }, { status: 404 });
        }
        return NextResponse.json({ message: "تم تحديث البيانات بنجاح", updatedClassroom }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const token = await verifySchoolAdmin(req);
        if (!token || token.role !== "SCHOOL_ADMIN") {
            return NextResponse.json({ error: "غير مصرح لك. يجب أن تكون مدير مدرسة" }, { status: 403 });
        }
        const { id } = await params;
        const deletedClassroom = await Classroom.findOneAndDelete({ _id: id, schoolId: token.schoolId })

        if (!deletedClassroom) {
            return NextResponse.json({ error: "تعذر العثور على القاعة" }, { status: 404 });
        }
        return NextResponse.json({ message: "تم حذف القاعة بنجاح" });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}