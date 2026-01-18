// File: app/api/user-orders/[id]/status/route.ts
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoConnect";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

/**
 * GET /api/user-orders/[id]/status
 * Retrieves only the status of a specific user order
 * 
 * This lightweight endpoint provides efficient status checking for order polling
 * or real-time status updates. It returns minimal data for performance optimization.
 * Useful for order tracking pages and status update components.
 * 
 * @param {Request} req - The incoming request object
 * @param {Object} context - Context object containing route parameters
 * @param {Promise<{id: string}>} context.params - Promise containing the order ID
 * 
 * @returns {Promise<NextResponse>}
 *   Success: { status: string } with current order status
 *   Unauthorized: { success: false, error: "Unauthorized" } with 401 status
 *   Not Found: { success: false, error: "Order not found" } with 404 status
 * 
 * @security Requires authenticated session and order ownership verification
 * 
 * @example
 * // Successful response
 * GET /api/user-orders/order_123456/status → 200
 * {
 *   "status": "preparing"
 * }
 * 
 * @example
 * // Order status values may include:
 * // - "pending", "confirmed", "preparing", "ready", "delivered", "canceled"
 * 
 * @performance Uses projection to fetch only status field, minimizing data transfer
 */
export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    /**
     * Authentication Verification
     * Verify user session and extract user email for ownership check
     */
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 } // Unauthorized
        );
    }

    /**
     * Parameter Extraction
     * Extract order ID from route parameters
     * Note: Next.js App Router requires awaiting the params Promise
     */
    const { id: orderId } = await context.params;

    // Establish database connection
    const client = await clientPromise;
    const db = client.db();

    /**
     * Efficient Status Lookup
     * Use projection to fetch only the status field
     * Reduces database load and network transfer for frequent status checks
     */
    const order = await db.collection("orders").findOne(
        {
            razorpayOrderId: orderId,        // Order identifier
            userEmail: session.user.email,   // Ownership verification
        },
        { projection: { status: 1 } }        // Fetch only status field for efficiency
    );

    // Handle case where order doesn't exist or doesn't belong to user
    if (!order) {
        return NextResponse.json(
            { success: false, error: "Order not found" },
            { status: 404 } // Not Found
        );
    }

    /**
     * Status Response
     * Return only the status field for minimal, efficient response
     * Ideal for polling mechanisms and real-time status updates
     */
    return NextResponse.json({ status: order.status });
}