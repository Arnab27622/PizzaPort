// User.ts
import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

import { IUserDoc } from '@/types/user';

/**
 * Mongoose schema for User model.
 */
const UserSchema = new Schema<IUserDoc>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, minlength: 6, select: false },
        admin: { type: Boolean, default: false },
        banned: { type: Boolean, default: false },
        image: { type: String },
        address: { type: String },
        gender: { type: String },
    },
    { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) {
        return;
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(this.password, salt);
        this.password = hash;
    } catch (error: unknown) {
        throw error as Error;
    }
});

/**
 * Compares a candidate password with the user's hashed password.
 * @param candidate - The password candidate to compare.
 * @returns {Promise<boolean>} True if passwords match, false otherwise.
 */
UserSchema.methods.comparePassword = async function (
    candidate: string
): Promise<boolean> {
    return bcrypt.compare(candidate, this.password || '');
};

const User: Model<IUserDoc> =
    mongoose.models.User || mongoose.model<IUserDoc>('User', UserSchema);

export default User;