/**
 * This file defines the "User" model.
 * A User represents anyone who has an account on our website, including
 * regular customers and administrators.
 */

import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUserDoc } from '@/types/user';

/**
 * UserSchema defines what information we store for each person.
 */
const UserSchema = new Schema<IUserDoc>(
    {
        name: { type: String, required: true, trim: true }, // The user's full name
        email: { type: String, required: true, unique: true, lowercase: true, trim: true }, // Unique login email
        password: { type: String, minlength: 6, select: false }, // Hashed password (hidden by default)
        admin: { type: Boolean, default: false },   // True if the user is an admin
        banned: { type: Boolean, default: false },  // True if the user is blocked from the site
        image: { type: String },                    // Profile picture URL
        address: { type: String },                  // Saved delivery address
        gender: { type: String },                   // User's gender (optional)
        phone: { type: String },                    // User's phone number
    },
    { timestamps: true } // Adds createdAt and updatedAt automatically
);

/**
 * Before saving a user to the database, we "hash" their password.
 * This is a security feature that turns a plain password into a scrambled string
 * so that even if the database is leaked, the actual passwords are safe.
 */
UserSchema.pre('save', async function () {
    // Only hash the password if it's new or being changed
    if (!this.isModified('password') || !this.password) {
        return;
    }

    try {
        const salt = await bcrypt.genSalt(10); // Generate a random "salt" for extra security
        const hash = await bcrypt.hash(this.password, salt); // Scramble the password
        this.password = hash;
    } catch (error: unknown) {
        throw error as Error;
    }
});

/**
 * This function checks if a password typed by a user matches the scrambled one in the database.
 */
UserSchema.methods.comparePassword = async function (
    candidate: string
): Promise<boolean> {
    return bcrypt.compare(candidate, this.password || '');
};

/**
 * The User model represents the "users" collection in MongoDB.
 */
const User: Model<IUserDoc> =
    mongoose.models.User || mongoose.model<IUserDoc>('User', UserSchema);

export default User;
