import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { School } from "@/models/School";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

async function verifyToken(token: string) {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;

        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));

        // تحقق بسيط من انتهاء الصلاحية
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            return null;
        }

        return payload;
    } catch {
        return null;
    }
}

async function verifySuperAdmin(req: NextRequest) {
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader) {
        console.log("⚠️ No cookie header");
        return null;
    }

    const tokenValue = cookieHeader
        .split("; ")
        .find((c) => c.startsWith("next-auth.session-token="))
        ?.split("=")[1];

    if (!tokenValue) {
        console.log("⚠️ No token value");
        return null;
    }

    const payload = await verifyToken(tokenValue);

    if (!payload) {
        console.log("⚠️ Invalid token");
        return null;
    }
    if (payload.role !== "SUPER_ADMIN") {
        return null;
    }

    return payload;
}

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const token = await verifySuperAdmin(req);

        if (!token) {
            return NextResponse.json(
                { error: "غير مصرح لك بالوصول لهذه البيانات" },
                { status: 403 }
            );
        }

        const schools = await School.find({})
            .populate("adminId", "name email")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, count: schools.length, schools });
    } catch (error: any) {
        console.error("❌ GET Error:", error);
        return NextResponse.json({ error: "تعذر جلب البيانات", message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const token = await verifySuperAdmin(req);
        if (!token) {
            return NextResponse.json({ error: "غير مصرح لك" }, { status: 403 });
        }

        const body = await req.json();
        const { name, adminEmail, adminName, password } = body;

        if (!name || !adminEmail || !adminName || !password) {
            return NextResponse.json({ error: "يرجى إكمال كافة البيانات" }, { status: 400 });
        }

        const exists = await School.findOne({ adminEmail });
        if (exists) return NextResponse.json({ error: "البريد مستخدم بالفعل" }, { status: 400 });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = await User.create({
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: "SCHOOL_ADMIN",
        });

        const newSchool = await School.create({
            name,
            adminEmail,
            adminId: newAdmin._id,
            subscriptionStatus: "trial",
        });

        await User.findByIdAndUpdate(newAdmin._id, { schoolId: newSchool._id });

        return NextResponse.json({
            success: true,
            message: "تم الإنشاء بنجاح",
            school: { id: newSchool._id, name, adminEmail },
            admin: { id: newAdmin._id, name: adminName, email: adminEmail },
        }, { status: 201 });

    } catch (error: any) {
        console.error("❌ POST Error:", error);
        return NextResponse.json({ error: "حدث خطأ", message: error.message }, { status: 500 });
    }
}