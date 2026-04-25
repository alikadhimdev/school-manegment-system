import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'],
        default: 'SCHOOL_ADMIN'
    },
    schoolId: {
        type: Schema.Types.ObjectId,
        ref: 'School',
        default: null
    },
    createdAt: { type: Date, default: Date.now },
});

export const User = models.User || model('User', UserSchema);