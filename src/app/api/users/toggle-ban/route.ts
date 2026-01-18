import clientPromise from "@/lib/mongoConnect";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from "mongodb";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

/**
 * POST /api/admin/users/ban
 * Updates a user's account suspension status (Admin only)
 * 
 * This endpoint allows administrators to suspend or reinstate user accounts.
 * Banned users lose access to authenticated features while maintaining their data.
 * 
 * @param {NextRequest} request - The incoming request containing ban update data
 * 
 * @requestBody {Object} JSON payload  
 * @requestBody {string} id - MongoDB ObjectId of the target user
 * @requestBody {boolean} banned - New ban status (true to ban, false to unban)
 * 
 * @returns {Promise<NextResponse>}
 *   Success: { success: true }
 *   Unauthorized: { error: 'Not authorized' } with 403 status
 *   Error: Internal server error (handled by Next.js)
 * 
 * @security Requires authenticated session with admin privileges
 * @validation Validates MongoDB ObjectId format
 * 
 * @example
 * // Suspend user account
 * POST /api/admin/users/ban
 * Request Body:
 * {
 *   "id": "67a1b2c3d4e5f67890123456",
 *   "banned": true
 * }
 * 
 * Response: 200
 * { "success": true }
 * 
 * @example
 * // Reinstate user account
 * POST /api/admin/users/ban  
 * Request Body:
 * {
 *   "id": "67a1b2c3d4e5f67890123456",
 *   "banned": false
 * }
 * 
 * @example
 * // Insufficient privileges
 * POST /api/admin/users/ban → 403
 * { "error": "Not authorized" }
 * 
 * @impact Banned users cannot login or access authenticated features
 * @note Banned status is checked during authentication in NextAuth callbacks
 * @consideration May want to add ban reason and expiration date in production
 */
export async function POST(request: NextRequest) {
    /**
     * Authentication & Authorization Check
     * Verifies the requesting user has admin privileges
     * Prevents unauthorized account suspension
     */
    const session = await getServerSession(authOptions);
    if (!session?.user?.admin) {
        return NextResponse.json(
            { error: 'Not authorized' },
            { status: 403 } // Forbidden
        );
    }

    /**
     * Request Data Parsing
     * Extracts target user ID and new ban status from JSON payload
     */
    const { id, banned } = await request.json();

    /**
     * Database Update Operation
     * Updates the target user's banned flag in the database
     * This flag is checked during authentication to prevent banned users from logging in
     */
    const db = (await clientPromise).db();
    await db.collection('users').updateOne(
        { _id: new ObjectId(id) }, // Target user by MongoDB ID
        { $set: { banned } }       // Update account suspension status
    );

    /**
     * Success Response
     * Returns confirmation of successful ban status update
     */
    return NextResponse.json({ success: true });
}