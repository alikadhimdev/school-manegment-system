import mongoose, { Schema, Document } from "mongoose";

const ExamSessionSchema: Schema = new Schema({
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true },
    classroomId: { type: Schema.Types.ObjectId, ref: "Classroom", required: true },
    grade: { type: String, required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "User" },
    students: [{
        studentId: { type: Schema.Types.ObjectId, ref: "Student" },
        seatNumber: Number
    }],
    term: { type: String },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

export const ExamSession = mongoose.models.ExamSession || mongoose.model("ExamSession", ExamSessionSchema);