import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoConnect";
import mongoose from "mongoose";

/**
 * GET /api/orders/[id]
 * Retrieves a specific order by its ID
 * 
 * This endpoint fetches a single order using the provided order ID from the URL parameters.
 * It converts MongoDB-specific types (ObjectId, Date) to serializable formats for JSON response.
 * 
 * @param {Request} req - The incoming request object (unused but required by Next.js)
 * @param {Object} context - Context object containing route parameters
 * @param {Promise<{id: string}>} context.params - Promise containing the route parameters
 * 
 * @returns {Promise<NextResponse>}
 *   Success: JSON object of the requested order with serialized fields
 *   Not Found: 404 status with error message
 *   Error: 500 status with generic server error message
 * 
 * @example
 * // Successful response
 * GET /api/orders/67a1b2c3d4e5f67890123456 → 200
 * {
 *   "_id": "67a1b2c3d4e5f67890123456",
 *   "items": [...],
 *   "total": 29.99,
 *   "createdAt": "2024-01-15T10:30:00.000Z",
 *   "canceledAt": null,
 *   ...
 * }
 * 
 * @example
 * // Order not found
 * GET /api/orders/invalid_id → 404
 * {
 *   "error": "Order not found"
 * }
 * 
 * @example
 * // Server error
 * GET /api/orders/67a1b2c3d4e5f67890123456 → 500
 * {
 *   "error": "Server error"
 * }
 */
export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    /**
     * Extract order ID from route parameters
     * Note: In Next.js App Router, params is a Promise that needs to be awaited
     */
    const { id } = await context.params; // await params first!

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

        /**
         * Create a safe, serializable version of the order
         * Converts MongoDB-specific types to JSON-compatible formats:
         * - ObjectId → string
         * - Date objects → ISO string format
         * - Preserves null/undefined values for optional fields
         */
        const safe = {
            ...order,
            _id: order._id.toString(), // Convert ObjectId to string
            createdAt: order.createdAt?.toISOString(), // Convert Date to ISO string
            canceledAt: order.canceledAt?.toISOString(), // Handle optional canceled date
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