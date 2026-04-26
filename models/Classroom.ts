import mongoose, { Schema, Document } from "mongoose";

export interface IClassroom extends Document {
    name: string;
    capacity: number;
    location?: string; // مثلاً: الطابق الثاني، الجناح الأيمن
    schoolId: mongoose.Types.ObjectId;
}

const ClassroomSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        capacity: { type: Number, required: true },
        location: { type: String },
        schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true },
    },
    { timestamps: true }
);

export const Classroom = mongoose.models.Classroom || mongoose.model<IClassroom>("Classroom", ClassroomSchema);