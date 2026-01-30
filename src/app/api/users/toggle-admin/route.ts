import clientPromise from '@/lib/mongoConnect';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import { authOptions } from '../../auth/[...nextauth]/authOptions';

/**
 * POST /api/admin/users/admin
 * Updates a user's administrator privileges (Super Admin only).
 * Allows granting or revoking admin access.
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