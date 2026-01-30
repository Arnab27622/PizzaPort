import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/mongoConnect';
import { v2 as cloudinary } from 'cloudinary';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import { z } from 'zod';

const ProfileUpdateSchema = z.object({
    name: z.string().min(1, 'Full Name is required').max(50, 'Name is too long'),
    address: z.string().min(1, 'Address is required').max(200, 'Address is too long'),
    gender: z.string().min(1, 'Gender is required'),
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Force dynamic rendering for this API route
 * Ensures fresh session data and prevents static optimization
 */
export const dynamic = 'force-dynamic';

/**
 * POST /api/profile/update
 * Updates user profile information including optional profile picture
 * 
 * This endpoint allows authenticated users to update their profile details:
 * - Name, address, and gender (required)
 * - Profile picture (optional)
 */
export async function POST(req: Request) {
    /**
     * Get user session from NextAuth
     * Required to verify authentication and identify the user
     */
    const session = await getServerSession(authOptions);

    /**
     * Authentication Check
     * Verify user is logged in and has a valid email address
     */
    if (!session?.user?.email) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 } // Unauthorized
        );
    }

    try {
        /**
         * Parse FormData from request
         * Contains both text fields and optional file upload
         */
        const formData = await req.formData();

        // Extract and validate profile fields
        const rawData = {
            name: formData.get('name') as string,
            address: formData.get('address') as string,
            gender: formData.get('gender') as string,
        };

        const validation = ProfileUpdateSchema.safeParse(rawData);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const { name, address, gender } = validation.data;

        // Extract optional profile picture file
        const file = formData.get('profilePic') as File | null;

        /**
         * Profile Update Object
         * Contains all fields to be updated in the database
         */
        const update: {
            name: string;
            address: string;
            gender: string;
            image?: string; // Optional profile image URL
        } = {
            name,
            address,
            gender,
        };

        /**
         * Profile Picture Upload Handling
         * Uploads image to Cloudinary if provided and valid
         */
        if (file && typeof file.arrayBuffer === 'function') {
            // Convert file to buffer
            const buffer = Buffer.from(await file.arrayBuffer());

            // Convert to base64
            const base64 = buffer.toString('base64');
            const dataURI = `data:${file.type};base64,${base64}`;

            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(dataURI, {
                resource_type: 'auto',
                folder: 'pizza-delivery/profiles',
            });

            update.image = result.secure_url;
        }

        /**
         * Database Update Operation
         * Updates user document matching the session email
         */
        const db = (await clientPromise).db();
        const result = await db.collection('users').updateOne(
            { email: session.user.email }, // Find user by email from session
            { $set: update } // Update specified fields
        );

        /**
         * Check if user was found and updated
         * matchedCount indicates how many documents were found (should be 1)
         */
        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 } // Not Found
            );
        }

        /**
         * Success Response
         * Returns simple success indicator
         * Note: Consider returning updated user data for immediate client update
         */
        return NextResponse.json({ ok: true });

    } catch (error) {
        /**
         * Error Handling
         * Catches file system errors, database errors, and other exceptions
         */
        console.error('Profile update error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 } // Internal Server Error
        );
    }
}