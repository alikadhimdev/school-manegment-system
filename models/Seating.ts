import mongoose, { Schema, Document } from "mongoose";

export interface ISeating extends Document {
    studentId: mongoose.Types.ObjectId;
    classroomId: mongoose.Types.ObjectId;
    schoolId: mongoose.Types.ObjectId;
    grade: string;
    seatNumber: number;
}

const SeatingSchema: Schema = new Schema(
    {
        studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
        classroomId: { type: Schema.Types.ObjectId, ref: "Classroom", required: true },
        schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true },
        grade: { type: String, required: true },
        seatNumber: { type: Number },
    },
    { timestamps: true }
);

export const Seating = mongoose.models.Seating || mongoose.model<ISeating>("Seating", SeatingSchema);