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
    try {
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
        const body = await request.json();
        const { id, banned } = body;

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
        // @ts-ignore
        if (session.user?.id === id && banned) {
            return NextResponse.json(
                { error: "You cannot ban yourself" },
                { status: 400 } // Bad Request
            );
        }

        const db = (await clientPromise).db();
        const usersCollection = db.collection('users');

        /**
         * Check Target User Status
         * 1. Validate user exists
         * 2. Prevent banning other admins for security
         */
        const targetUser = await usersCollection.findOne({ _id: new ObjectId(id) });

        if (!targetUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Prevent banning other admins
        if (targetUser.admin && banned) {
            return NextResponse.json(
                { error: "Cannot ban another administrator. Revoke admin privileges first." },
                { status: 403 }
            );
        }

        /**
         * Database Update Operation
         * Updates the target user's banned flag in the database
         * This flag is checked during authentication to prevent banned users from logging in
         */
        const result = await usersCollection.updateOne(
            { _id: new ObjectId(id) }, // Target user by MongoDB ID
            { $set: { banned } }       // Update account suspension status
        );

        if (result.modifiedCount === 0) {
            // This might happen if the banned status was already what we requested
            // We can still consider it a success, or check matchedCount
            if (result.matchedCount === 0) {
                return NextResponse.json({ error: 'User not found during update' }, { status: 404 });
            }
        }

        /**
         * Success Response
         * Returns confirmation of successful ban status update
         */
        return NextResponse.json({ success: true, banned });

    } catch (error) {
        console.error("Error in toggle-ban:", error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}