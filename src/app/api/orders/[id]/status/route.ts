import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongoConnect";
import { ObjectId } from "mongodb";

/**
 * PATCH /api/orders/[id]/status
 * Updates the status of a specific order
 * 
 * This endpoint allows flexible status updates for orders.
 * Used for order lifecycle management (preparing, ready, delivered, etc.)
 * 
 * @param {NextRequest} req - The incoming request object containing JSON body
 * @param {Object} context - Context object containing route parameters
 * @param {Promise<{id: string}>} context.params - Promise containing the order ID from URL
 * 
 * @requestBody {Object} JSON object with status field
 * @requestBody {string} status - New status value for the order
 * 
 * @returns {Promise<NextResponse>}
 *   Success: { success: true }
 *   Error: { success: false, error: string } with 500 status
 * 
 * @throws {Error} Database connection issues, invalid order ID, JSON parse errors
 * 
 * @example
 * // Request
 * PATCH /api/orders/67a1b2c3d4e5f67890123456/status
 * Body: { "status": "preparing" }
 * 
 * // Response
 * {
 *   "success": true
 * }
 * 
 * @example
 * // Error response
 * PATCH /api/orders/67a1b2c3d4e5f67890123456/status → 500
 * {
 *   "success": false,
 *   "error": "Failed to update order status"
 * }
 */
export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        /**
         * Extract order ID from route parameters and new status from request body
         * Note: In Next.js App Router, params is a Promise that needs to be awaited
         */
        const { id: orderId } = await context.params;

        /**
         * Parse JSON request body to get the new status
         * Expected format: { "status": "new_status_value" }
         */
        const { status } = await req.json();

        // Establish database connection
        const client = await clientPromise;
        const db = client.db();

        /**
         * Update order status in the database
         * Only modifies the status field while preserving other order properties
         */
        await db.collection("orders").updateOne(
            { _id: new ObjectId(orderId) }, // Find order by MongoDB ObjectId
            { $set: { status } } // Update only the status field
        );

        // Return success response
        return NextResponse.json({ success: true });
    } catch (error) {
        /**
         * Handle various error scenarios:
         * - Invalid ObjectId format
         * - Malformed JSON in request body
         * - Database connection issues
         * - Order not found (updateOne doesn't throw if no document matches)
         * - Network errors
         */
        console.error("Error updating order status:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update order status" },
            { status: 500 } // Internal Server Error
        );
    }
}