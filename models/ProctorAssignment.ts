import { Schema, model, models } from 'mongoose';

const ProctorAssignmentSchema = new Schema({
    schoolId: {
        type: Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    teacherId: {
        type: Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    hallId: {
        type: Schema.Types.ObjectId,
        ref: 'Hall',
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
});

// لمنع تكرار تكليف نفس المعلم في نفس الوقت
ProctorAssignmentSchema.index({ teacherId: 1, date: 1, session: 1 }, { unique: true });

export const ProctorAssignment = models.ProctorAssignment || model('ProctorAssignment', ProctorAssignmentSchema);