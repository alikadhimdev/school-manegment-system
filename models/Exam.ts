import { Schema, model, models } from 'mongoose';

const ExamSchema = new Schema({
    schoolId: {
        type: Schema.Types.ObjectId,
        ref: 'School', required: true
    },
    grade: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    session: {
        type: String,
        enum: ['صباحي', 'مسائي'],
        required: true
    },
    startTime: String,
    endTime: String,
});

export const Exam = models.Exam || model('Exam', ExamSchema);