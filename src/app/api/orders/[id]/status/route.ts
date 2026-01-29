import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongoConnect";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";
import { ORDER_STATUS } from "@/types/order";

/**
 * PATCH /api/orders/[id]/status
 * Updates the status of a specific order (Admin only)
 */
export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user?.admin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const { id: orderId } = await context.params;
        const { status } = await req.json();

        // Validate status value against allowed values
        const validStatuses = Object.values(ORDER_STATUS);
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db();

        await db.collection("orders").updateOne(
            { _id: new ObjectId(orderId) },
            { $set: { status } }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating order status:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update order status" },
            { status: 500 }
        );
    }
}