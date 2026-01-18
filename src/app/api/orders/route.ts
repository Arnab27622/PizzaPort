import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoConnect";

/**
 * GET /api/orders
 * Retrieves all orders from the database
 * 
 * This endpoint fetches all orders sorted by creation date (newest first)
 * and converts MongoDB ObjectId to string for client-side compatibility.
 * 
 * @returns {Promise<NextResponse>} 
 *   Success: JSON array of order objects with string _id
 *   Error: JSON error response with 500 status code
 * 
 * @example
 * // Successful response
 * GET /api/orders → 200
 * [
 *   {
 *     "_id": "67a1b2c3d4e5f67890123456",
 *     "items": [...],
 *     "total": 29.99,
 *     "createdAt": "2024-01-15T10:30:00.000Z",
 *     ...
 *   }
 * ]
 * 
 * @example
 * // Error response
 * GET /api/orders → 500
 * {
 *   "success": false,
 *   "error": "Failed to fetch orders"
 * }
 */
export async function GET() {
    try {
        // Establish database connection
        const client = await clientPromise;
        const db = client.db();

        /**
         * Fetch all orders from the database
         * - Uses "orders" collection
         * - Sorts by createdAt in descending order (newest first)
         * - Converts cursor to array for JSON serialization
         */
        const orders = await db.collection("orders")
            .find()
            .sort({ createdAt: -1 })
            .toArray();

        /**
         * Convert MongoDB ObjectId to string for client compatibility
         * MongoDB ObjectId is not serializable to JSON, so we convert to string
         */
        const ordersWithStringId = orders.map(order => ({
            ...order,
            _id: order._id.toString(), // Convert ObjectId to string
        }));

        // Return successful response with orders data
        return NextResponse.json(ordersWithStringId);
    } catch (error) {
        /**
         * Handle database errors and connection issues
         * Logs the actual error for debugging while returning generic message to client
         */
        console.error("Error fetching orders:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch orders" },
            { status: 500 } // Internal Server Error
        );
    }
}