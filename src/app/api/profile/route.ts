import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/mongoConnect';
import { v2 as cloudinary } from 'cloudinary';
import { authOptions } from '../auth/[...nextauth]/authOptions';

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
 * 
 * @param {Request} req - The incoming request containing FormData
 * 
 * @returns {Promise<NextResponse>}
 *   Success: { ok: true }
 *   Unauthorized: { error: 'Unauthorized' } with 401 status
 *   Not Found: { error: 'User not found' } with 404 status
 *   Error: Server error with appropriate status code
 * 
 * @throws {Error} File system errors, database connection issues
 * 
 * @example
 * // Successful update
 * POST /api/profile/update
 * FormData:
 *   - name: "John Doe"
 *   - address: "123 Main St"
 *   - gender: "male"
 *   - profilePic: [File]
 * 
 * Response: 200
 * { "ok": true }
 * 
 * @example
 * // Unauthorized request
 * POST /api/profile/update → 401
 * { "error": "Unauthorized" }
 * 
 * @example
 * // User not found in database
 * POST /api/profile/update → 404
 * { "error": "User not found" }
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

        // Extract required profile fields from form data
        const name = formData.get('name') as string;
        const address = formData.get('address') as string;
        const gender = formData.get('gender') as string;

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