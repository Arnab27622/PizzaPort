import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoConnect";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

/**
 * GET /api/orders/[id]
 * Retrieves a specific order by its ID
 * 
 * This endpoint fetches a single order using the provided order ID from the URL parameters.
 * It converts MongoDB-specific types (ObjectId, Date) to serializable formats for JSON response.
 * 
 * @param {Request} req - The incoming request object
 * @param {Object} context - Context object containing route parameters
 * @param {Promise<{id: string}>} context.params - Promise containing the route parameters
 * 
 * @returns {Promise<NextResponse>}
 *   Success: JSON object of the requested order with serialized fields
 *   Unauthorized: 401 if not logged in
 *   Forbidden: 403 if user is not authorized to see this order
 *   Not Found: 404 status with error message
 *   Error: 500 status with generic server error message
 * 
 * @security Admins can access any order. Regular users can only access their own orders.
 */
export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /**
     * Extract order ID from route parameters
     */
    const { id } = await context.params;

    try {
        // Establish database connection
        const client = await clientPromise;
        const db = client.db();

        /**
         * Find order by ID in the database
         * - Uses mongoose.Types.ObjectId for proper MongoDB ID conversion
         * - Returns null if no order matches the provided ID
         */
        const order = await db.collection("orders").findOne({
            _id: new mongoose.Types.ObjectId(id)
        });

        // Handle case where order is not found
        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 } // Not Found
            );
        }

        // Authorization check: Admin or Order Owner
        const isAdmin = session.user?.admin;
        const isOwner = order.userEmail === session.user?.email;

        if (!isAdmin && !isOwner) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        /**
         * Create a safe, serializable version of the order
         * Converts MongoDB-specific types to JSON-compatible formats:
         * - ObjectId → string
         * - Date objects → ISO string format
         * - Excludes internal security fields (securityHash)
         */
        const { securityHash: _, ...rest } = order;
        const safe = {
            ...rest,
            _id: order._id.toString(),
            createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
            canceledAt: order.canceledAt instanceof Date ? order.canceledAt.toISOString() : order.canceledAt,
            verifiedAt: order.verifiedAt instanceof Date ? order.verifiedAt.toISOString() : order.verifiedAt,
        };

        // Return successful response with serialized order data
        return NextResponse.json(safe);
    } catch (err) {
        /**
         * Handle various error scenarios:
         * - Invalid ObjectId format (handled by mongoose)
         * - Database connection issues
         * - Unexpected server errors
         */
        console.error(err); // Log detailed error for debugging

        return NextResponse.json(
            { error: "Server error" },
            { status: 500 } // Internal Server Error
        );
    }
}