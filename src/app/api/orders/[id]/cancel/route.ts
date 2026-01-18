import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongoConnect";
import { ObjectId } from "mongodb";

/**
 * PATCH /api/orders/[id]/cancel
 * Cancels a specific order by ID
 * 
 * This endpoint marks an order as canceled and initiates refund process.
 * It updates multiple order properties to reflect cancellation status.
 * 
 * @param {NextRequest} req - The incoming request object
 * @param {Object} context - Context object containing route parameters
 * @param {Promise<{id: string}>} context.params - Promise containing the order ID from URL
 * 
 * @returns {Promise<NextResponse>}
 *   Success: { success: true }
 *   Error: { success: false, error: string } with 500 status
 * 
 * @throws {Error} Database connection issues, invalid order ID
 * 
 * @example
 * // Successful cancellation
 * PATCH /api/orders/67a1b2c3d4e5f67890123456/cancel → 200
 * {
 *   "success": true
 * }
 * 
 * @example
 * // Error response
 * PATCH /api/orders/67a1b2c3d4e5f67890123456/cancel → 500
 * {
 *   "success": false,
 *   "error": "Failed to cancel order"
 * }
 */
export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        /**
         * Extract order ID from route parameters
         * Note: In Next.js App Router, params is a Promise that needs to be awaited
         * We rename 'id' to 'orderId' for clarity
         */
        const { id: orderId } = await context.params;

        // Establish database connection
        const client = await clientPromise;
        const db = client.db();

        /**
         * Update order to canceled status with multiple field changes
         * This atomic operation ensures all changes happen together
         * 
         * Fields updated:
         * - status: Set to "canceled" to indicate order cancellation
         * - canceledAt: Timestamp when cancellation occurred
         * - paymentStatus: Set to "refund_initiated" to trigger refund process
         */
        await db.collection("orders").updateOne(
            { _id: new ObjectId(orderId) }, // Find order by MongoDB ObjectId
            {
                $set: {
                    status: "canceled",           // Mark order as canceled
                    canceledAt: new Date(),       // Record cancellation timestamp
                    paymentStatus: "refund_initiated", // Initiate refund workflow
                },
            }
        );

        // Return success response
        return NextResponse.json({ success: true });
    } catch (error) {
        /**
         * Handle various error scenarios:
         * - Invalid ObjectId format
         * - Database connection issues
         * - Order not found (updateOne doesn't throw if no document matches)
         * - Network errors
         */
        console.error("Error canceling order:", error);
        return NextResponse.json(
            { success: false, error: "Failed to cancel order" },
            { status: 500 } // Internal Server Error
        );
    }
}