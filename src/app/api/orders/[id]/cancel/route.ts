import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongoConnect";
import { ORDER_STATUS } from "@/types/order";
import { PAYMENT_STATUS } from "@/types/payment";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";

/**
 * PATCH /api/orders/[id]/cancel
 * Cancels a specific order by ID (Owner or Admin only)
 */
export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id: orderId } = await context.params;

        const client = await clientPromise;
        const db = client.db();

        // Fetch order to check ownership
        const order = await db.collection("orders").findOne({ _id: new ObjectId(orderId) });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Authorization check: Admin or Order Owner
        const isAdmin = session.user?.admin;
        const isOwner = order.userEmail === session.user?.email;

        if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        /**
         * Update order to canceled status with multiple field changes
         */
        await db.collection("orders").updateOne(
            { _id: new ObjectId(orderId) },
            {
                $set: {
                    status: ORDER_STATUS.CANCELED,
                    canceledAt: new Date(),
                    paymentStatus: PAYMENT_STATUS.REFUND_INITIATED,
                },
            }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error canceling order:", error);
        return NextResponse.json(
            { success: false, error: "Failed to cancel order" },
            { status: 500 }
        );
    }
}