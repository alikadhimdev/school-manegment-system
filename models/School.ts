import { Schema, model, models } from 'mongoose';

const SchoolSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    adminEmail: {
        type: String,
        required: true,
        unique: true
    },
    subscriptionStatus: {
        type: String,
        enum: ['active', 'expired', 'trial'], default: 'trial'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
}
);

export const School = models.School || model('School', SchoolSchema);