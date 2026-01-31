import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import { PAYMENT_STATUS } from "@/types/payment";

/**
 * GET /api/orders
 * Retrieves all orders from the database (Admin only).
 * Sorted by creation date (newest first).
 */
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user?.admin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
        const orders = await db.collection("orders").aggregate([
            {
                $match: {
                    paymentStatus: { $in: [PAYMENT_STATUS.VERIFIED, PAYMENT_STATUS.COMPLETED, PAYMENT_STATUS.REFUND_INITIATED] }
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userEmail",
                    foreignField: "email",
                    as: "userDetails"
                }
            },
            {
                $addFields: {
                    userImage: { $arrayElemAt: ["$userDetails.image", 0] },
                    _id: { $toString: "$_id" }
                }
            },
            {
                $project: {
                    userDetails: 0
                }
            }
        ]).toArray();

        return NextResponse.json(orders);
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