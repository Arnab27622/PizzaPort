//app/api/user-orders/route.ts
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoConnect";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import { PAYMENT_STATUS } from "@/types/payment";

/**
 * GET /api/user-orders
 * Retrieves the authenticated user's order history
 * 
 * This endpoint provides a paginated list of the current user's orders,
 * sorted by creation date (newest first). It includes essential order
 * information for display in order history pages.
 * 
 * @returns {Promise<NextResponse>}
 *   Success: Array of order objects with essential fields
 *   Unauthorized: { success: false, error: "Unauthorized" } with 401 status
 *   Error: { success: false, error: "Failed to fetch orders" } with 500 status
 * 
 * @security Requires authenticated session with valid user email
 * 
 * @example
 * // Successful response
 * GET /api/user-orders → 200
 * [
 *   {
 *     "_id": "67a1b2c3d4e5f67890123456",
 *     "razorpayOrderId": "order_123456",
 *     "total": 1250.50,
 *     "status": "delivered",
 *     "createdAt": "2024-01-15T10:30:00.000Z",
 *     "cart": [
 *       { "name": "Margherita Pizza", "imageUrl": "/uploads/pizza.jpg" }
 *     ]
 *   }
 * ]
 * 
 * @example
 * // Unauthorized access
 * GET /api/user-orders → 401
 * {
 *   "success": false,
 *   "error": "Unauthorized"
 * }
 */
export async function GET() {
    /**
     * Authentication Verification
     * Retrieve user session to verify authentication and get user email
     * Email is used to scope orders to the current user only
     */
    const session = await getServerSession(authOptions);

    // Validate user is authenticated and has email address
    if (!session?.user?.email) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 } // Unauthorized
        );
    }

    try {
        // Establish database connection
        const client = await clientPromise;
        const db = client.db();


        /**
         * Orders Query
         * Retrieve user's orders with field projection for optimal performance
         * Only fetches necessary fields to reduce data transfer and improve speed
         */
        const orders = await db.collection("orders")
            .find({
                userEmail: session.user.email, // Scope to current user only
                paymentStatus: { $in: [PAYMENT_STATUS.VERIFIED, PAYMENT_STATUS.COMPLETED, PAYMENT_STATUS.REFUND_INITIATED] }
            })
            .project({
                razorpayOrderId: 1,    // Payment gateway order reference
                total: 1,              // Order total amount
                status: 1,             // Current order status
                createdAt: 1,          // Order creation timestamp
                "cart.name": 1,        // Product names from cart items
                "cart.imageUrl": 1     // Product images from cart items
            })
            .sort({ createdAt: -1 })   // Newest orders first
            .limit(50)                 // Prevent overwhelming response size
            .toArray();

        /**
         * Data Serialization
         * Convert MongoDB-specific types to JSON-compatible formats
         * - ObjectId → string for client compatibility
         * - Date → ISO string for consistent date handling
         */
        const formattedOrders = orders.map(order => ({
            ...order,
            _id: order._id.toString(),           // Convert ObjectId to string
            createdAt: order.createdAt.toISOString(), // Convert Date to ISO string
        }));

        // Return formatted orders array
        return NextResponse.json(formattedOrders);

    } catch (error) {
        /**
         * Error Handling
         * Log detailed error for debugging while returning generic message to client
         * Prevents exposure of sensitive database or system information
         */
        console.error("Error fetching orders:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch orders" },
            { status: 500 } // Internal Server Error
        );
    }
}