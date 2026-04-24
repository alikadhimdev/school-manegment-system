import { Schema, model, models } from 'mongoose';

const StudentSchema = new Schema({
    schoolId: {
        type: Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    grade: {
        type: String,
        required: true
    },
    studentIdNumber: String,
    hallId: {
        type: Schema.Types.ObjectId,
        ref: 'Hall'
    },
    seatNumber: Number,
});

export const Student = models.Student || model('Student', StudentSchema);