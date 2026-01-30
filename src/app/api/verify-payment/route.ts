import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import clientPromise from "@/lib/mongoConnect";
import { ORDER_STATUS } from "@/types/order";
import { PAYMENT_STATUS } from "@/types/payment";

/**
 * POST /api/payment/verify
 * Verifies Razorpay payment authenticity and updates order status.
 */
export async function POST(req: NextRequest) {
    /**
     * Parse request body containing payment verification data
     * All fields are required for complete payment verification
     */
    const body = await req.json();
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        securityHash,
        orderId
    } = body;

    /**
     * RAZORPAY SIGNATURE VERIFICATION
     * 
     * Critical security step: Verifies the payment response is genuinely from Razorpay
     * Prevents man-in-the-middle attacks and payment fraud
     * 
     * Signature generation formula: HMAC-SHA256(order_id + "|" + payment_id, secret_key)
     */
    const generated_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY!) // Use Razorpay secret key
        .update(razorpay_order_id + "|" + razorpay_payment_id)  // Concatenated order and payment IDs
        .digest("hex");                                         // Generate HMAC hex digest

    /**
     * Signature Comparison
     * If signatures don't match, the payment response may be fraudulent
     */
    if (generated_signature !== razorpay_signature) {
        return NextResponse.json(
            { success: false, error: "Invalid signature" },
            { status: 400 } // Bad Request - potential fraud attempt
        );
    }

    /**
     * SECURITY HASH VERIFICATION
     * 
     * Second security layer: Verifies order data hasn't been tampered with
     * Compares the security hash sent by client with the one stored during order creation
     * Prevents clients from modifying order amounts or contents after payment
     */
    const client = await clientPromise;
    const db = client.db();

    // Retrieve original order from database
    const order = await db.collection("orders").findOne({ razorpayOrderId: orderId });

    // Verify order exists in database
    if (!order) {
        return NextResponse.json(
            { success: false, error: "Order not found" },
            { status: 404 } // Not Found
        );
    }

    /**
     * Security Hash Comparison
     * If hashes don't match, the order may have been tampered with client-side
     * This could indicate attempts to modify pricing or order contents
     */
    if (order.securityHash !== securityHash) {
        return NextResponse.json(
            { success: false, error: "Order tampering detected" },
            { status: 400 } // Bad Request - data integrity violation
        );
    }

    /**
     * PAYMENT STATUS UPDATE
     * 
     * Only reached if both security validations pass
     * Updates order with payment verification details and moves to "placed" status
     */
    const updateData: {
        paymentStatus: string;
        razorpayPaymentId: string;
        verifiedAt: Date;
        status?: string;
    } = {
        paymentStatus: PAYMENT_STATUS.VERIFIED,        // Mark payment as manually verified
        razorpayPaymentId: razorpay_payment_id,        // Store Razorpay payment reference
        verifiedAt: new Date(),                        // Timestamp of verification
    };

    /**
     * Order Status Protection
     * Only move to PLACED if it hasn't progressed yet or is new
     */
    if (!order.status || order.status === ORDER_STATUS.PLACED) {
        updateData.status = ORDER_STATUS.PLACED;
    }

    await db.collection("orders").updateOne(
        { _id: order._id },
        { $set: updateData }
    );

    // If order has a coupon, increment its usage count ONLY if not already counted (e.g., by webhook)
    const alreadyCounted = order.paymentStatus === PAYMENT_STATUS.COMPLETED ||
        order.paymentStatus === PAYMENT_STATUS.VERIFIED;

    if (order.couponCode && !alreadyCounted) {
        await db.collection("coupons").updateOne(
            { code: order.couponCode },
            { $inc: { usageCount: 1 } }
        );
    }

    /**
     * Success Response
     * Client can now safely confirm the order to the user
     */
    return NextResponse.json({ success: true });
}