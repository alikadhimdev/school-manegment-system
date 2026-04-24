import { Schema, model, models } from 'mongoose';

const HallSchema = new Schema({
    schoolId: {
        type: Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    assignedGrades: [String],
    seats: [{
        studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
        seatNumber: Number
    }]
});

export const Hall = models.Hall || model('Hall', HallSchema);