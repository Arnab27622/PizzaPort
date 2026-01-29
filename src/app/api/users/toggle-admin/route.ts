import clientPromise from '@/lib/mongoConnect';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import { authOptions } from '../../auth/[...nextauth]/authOptions';

/**
 * POST /api/admin/users/admin
 * Updates a user's administrator privileges (Super Admin only)
 * 
 * This endpoint allows authorized administrators to grant or revoke admin privileges
 * for other users. Requires the requesting user to have admin privileges.
 * 
 * @param {NextRequest} request - The incoming request containing update data
 * 
 * @requestBody {Object} JSON payload
 * @requestBody {string} id - MongoDB ObjectId of the target user
 * @requestBody {boolean} admin - New admin status (true to grant, false to revoke)
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
 * // Grant admin privileges
 * POST /api/admin/users/admin
 * Request Body: 
 * {
 *   "id": "67a1b2c3d4e5f67890123456",
 *   "admin": true
 * }
 * 
 * Response: 200
 * { "success": true }
 * 
 * @example
 * // Revoke admin privileges  
 * POST /api/admin/users/admin
 * Request Body:
 * {
 *   "id": "67a1b2c3d4e5f67890123456", 
 *   "admin": false
 * }
 * 
 * @example
 * // Insufficient privileges
 * POST /api/admin/users/admin → 403
 * { "error": "Not authorized" }
 * 
 * @warning Granting admin privileges provides full system access
 * @note Consider adding additional safeguards for self-demotion prevention
 */
export async function POST(request: NextRequest) {
    /**
     * Authentication & Authorization Check
     * Verifies the requesting user has a valid session and admin privileges
     * Prevents unauthorized privilege escalation
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
     * Extracts target user ID and new admin status from JSON payload
     */
    const { id, admin } = await request.json();

    /**
     * ID Format Validation
     * Ensures the provided ID is a valid MongoDB ObjectId
     * Prevents invalid queries and improper error handling
     */
    if (!ObjectId.isValid(id)) {
        return NextResponse.json(
            { error: 'Invalid user ID format' },
            { status: 400 } // Bad Request
        );
    }

    /**
     * Self-Demotion Prevention
     * Prevent the currently logged-in admin from revoking their own admin privileges.
     * This ensures at least one active admin remains to manage the system.
     */
    if (session.user && "id" in session.user && session.user.id === id && admin === false) {
        return NextResponse.json(
            { error: "You cannot revoke your own admin privileges" },
            { status: 400 } // Bad Request
        );
    }


    /**
     * Database Update Operation
     * Updates the target user's admin flag in the database
     * Uses MongoDB ObjectId for precise document targeting
     */
    const db = (await clientPromise).db();
    await db.collection('users').updateOne(
        { _id: new ObjectId(id) }, // Target user by MongoDB ID
        { $set: { admin } }        // Update admin privilege status
    );

    /**
     * Success Response
     * Returns confirmation of successful update
     */
    return NextResponse.json({ success: true });
}