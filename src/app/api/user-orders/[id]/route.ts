import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoConnect";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

/**
 * GET /api/user-orders/[id]
 * Retrieves detailed information for a specific user order
 * This endpoint provides comprehensive order details for a single order,
 * Ensures users can only access their own orders.
 */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    /**
     * Authentication Verification
     * Ensure user is logged in and has valid session
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
     * Note: In Next.js App Router, params is a Promise that must be awaited
     */
    const { id: orderId } = await params;

    try {
        // Establish database connection
        const client = await clientPromise;
        const db = client.db();

        /**
         * Order Lookup with Ownership Check
         * Find order by Razorpay order ID AND verify it belongs to current user
         * This prevents users from accessing other users' orders
         */
        const order = await db.collection("orders").findOne({
            razorpayOrderId: orderId,        // Order identifier from payment gateway
            userEmail: session.user.email,   // Ownership verification
            paymentStatus: { $in: ["verified", "completed", "refund_initiated"] }
        });

        // Handle case where order doesn't exist or doesn't belong to user
        if (!order) {
            return NextResponse.json(
                { success: false, error: "Order not found" },
                { status: 404 } // Not Found
            );
        }

        /**
         * Data Serialization for Client
         * Convert MongoDB-specific types to JSON-compatible formats
         * Includes optional field handling for canceled orders
         */
        const safeOrder = {
            ...order,
            _id: order._id.toString(),                    // Convert ObjectId to string
            createdAt: order.createdAt.toISOString(),     // Convert Date to ISO string
            canceledAt: order.canceledAt?.toISOString(),  // Handle optional canceled date
        };

        // Return complete order details
        return NextResponse.json(safeOrder);

    } catch (err) {
        /**
         * Error Handling
         * Log full error for debugging while returning generic message to client
         */
        console.error("Order detail fetch error:", err);
        return NextResponse.json(
            { success: false, error: "Failed to fetch order" },
            { status: 500 } // Internal Server Error
        );
    }
}