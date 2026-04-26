import mongoose, { Schema, Document } from "mongoose";

export interface IStudent extends Document {
    name: string;
    rollNumber: string;
    grade: string;
    schoolId: mongoose.Types.ObjectId;
}

const StudentSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        rollNumber: { type: String, required: true },
        grade: { type: String, required: true },
        schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true },
    },
    { timestamps: true }
);

StudentSchema.index({ rollNumber: 1, schoolId: 1, grade: 1 }, { unique: true });

export const Student = mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);