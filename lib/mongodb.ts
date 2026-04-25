import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('يرجى تعريف متغير MONGODB_URI في ملف .env.local');
}

export const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 1) return;

        await mongoose.connect(MONGODB_URI);
        console.log("تم الاتصال بقاعدة البيانات بنجاح");
    } catch (error) {
        console.error("خطأ في الاتصال بقاعدة البيانات:", error);
        throw new Error("فشل الاتصال بـ MongoDB");
    }
};