import clientPromise from "@/lib/mongoConnect";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from "mongodb";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

/**
 * POST /api/admin/users/ban
 * Updates a user's account suspension status (Admin only).
 * Banned users lose access to authenticated features.
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
     * Self-Ban Prevention
     * Prevent the currently logged-in admin from banning themselves.
     * This ensures admins cannot accidentally lock themselves out.
     */
    if (session.user && "id" in session.user && session.user.id === id && banned === true) {
        return NextResponse.json(
            { error: "You cannot ban yourself" },
            { status: 400 } // Bad Request
        );
    }

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