import { Schema, model, models } from 'mongoose';

const TeacherSchema = new Schema({
    schoolId: {
        type: Schema.Types.ObjectId,
        ref: 'School', required: true
    },
    name: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    maxSessions: {
        type: Number,
        default: 10
    },
    currentSessions: {
        type: Number,
        default: 0
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
});

export const Teacher = models.Teacher || model('Teacher', TeacherSchema);