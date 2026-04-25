import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import clientPromise from "@/lib/mongoConnect";
import { PAYMENT_STATUS } from "@/types/payment";
import { ORDER_STATUS } from "@/types/order";

/**
 * POST /api/webhooks/razorpay
 * Handles Razorpay webhook events for real-time payment status updates.
 */
export async function POST(req: NextRequest) {
    /**
     * Razorpay Webhook Secret from environment variables
     * Used to verify webhook request authenticity
     * 
     * CRITICAL: This secret must be set in environment variables
     */
    const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        console.error('RAZORPAY_WEBHOOK_SECRET environment variable is missing');
        return NextResponse.json(
            { success: false, error: "Server configuration error" },
            { status: 500 }
        );
    }
    /**
     * RAW BODY EXTRACTION
     * 
     * Webhook signature verification requires the exact raw request body
     * JSON parsing and re-stringifying can alter the content and break signature validation
     */
    const rawBody = await req.text(); // Raw body needed for HMAC verification

    /**
     * SIGNATURE VERIFICATION
     * 
     * Critical security step: Verifies the webhook request is genuinely from Razorpay
     * Prevents malicious actors from sending fake payment notifications
     */
    const signature = req.headers.get("x-razorpay-signature");

    // Check if signature header is present
    if (!signature) {
        return NextResponse.json(
            { success: false, error: "Missing signature" },
            { status: 400 } // Bad Request - missing security header
        );
    }

    /**
     * Generate expected signature using webhook secret and raw body
     * Razorpay signs the entire raw request body with the webhook secret
     * We need a type assertion here because TypeScript can't guarantee the secret
     * exists at runtime, even though we validate it at module load time.
     */
    const expectedSignature = crypto
        .createHmac("sha256", WEBHOOK_SECRET as string) // Use webhook-specific secret
        .update(rawBody)                      // Use exact raw request body
        .digest("hex");                       // Generate HMAC hex digest

    /**
     * Signature Comparison
     * If signatures don't match, the webhook may be spoofed
     */
    try {
        const isValid = crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );

        if (!isValid) {
            return NextResponse.json(
                { success: false, error: "Signature mismatch" },
                { status: 400 } // Bad Request - potential webhook spoofing
            );
        }
    } catch {
        return NextResponse.json(
            { success: false, error: "Signature validation error" },
            { status: 400 }
        );
    }

    /**
     * PAYLOAD PROCESSING
     * 
     * Only reached if webhook signature is valid
     * Parse the JSON payload and handle different event types
     */
    const payload = JSON.parse(rawBody);

    const client = await clientPromise;
    const db = client.db();

    // Idempotency: Prevent duplicate webhooks from running the same logic twice
    // Using atomic upsert to prevent race conditions during simultaneous webhook retries
    const eventId = req.headers.get("x-razorpay-event-id");
    
    if (!eventId) {
        console.warn("Missing x-razorpay-event-id header in webhook");
        return NextResponse.json(
            { success: false, error: "Missing event ID" },
            { status: 400 }
        );
    }

    const result = await db.collection("webhooks").updateOne(
        { eventId },
        { $setOnInsert: { createdAt: new Date() } },
        { upsert: true }
    );

    // matchedCount > 0 means the document already existed, so this is a duplicate webhook
    if (result.matchedCount > 0) {
        return NextResponse.json({ success: true });
    }

    /**
     * Webhook Event Handler
     * Processes different Razorpay webhook events with appropriate business logic
     */
    try {
        console.log("Event:", payload.event);

        switch (payload.event) {
            case "payment.authorized":
            case "payment.captured": {
                /**
                 * PAYMENT CAPTURED/AUTHORIZED EVENT
                 * 
                 * Triggered when Razorpay successfully captures the payment.
                 * This is the final confirmation of successful payment.
                 */
                if (!payload?.payload?.payment?.entity) {
                    return NextResponse.json({ success: false, error: "Invalid payload structure" }, { status: 400 });
                }
                const payment = payload.payload.payment.entity;
                const rOrderId = payment.order_id;
                console.log("Order ID:", rOrderId);

                // Fetch current order state to prevent regression
                const existingOrder = await db.collection("orders").findOne({ razorpayOrderId: rOrderId });

                if (existingOrder) {
                    const updateData: {
                        paymentStatus: string;
                        webhookReceived: boolean;
                        status?: string;
                    } = {
                        paymentStatus: PAYMENT_STATUS.COMPLETED, // Final payment status
                        webhookReceived: true                    // Flag indicating webhook processing
                    };

                    /**
                     * Order Status Protection
                     * 
                     * Only set status to PLACED if it's currently pending or already placed.
                     * Prevents resetting orders that have already progressed (e.g., PREPARING, OUT_FOR_DELIVERY).
                     * Also prevents resurrecting CANCELED orders.
                     */
                    if (!existingOrder.status || existingOrder.status === ORDER_STATUS.PLACED) {
                        updateData.status = ORDER_STATUS.PLACED;
                    }

                    await db.collection("orders").updateOne(
                        { _id: existingOrder._id },
                        { $set: updateData }
                    );

                    /**
                     * Coupon Usage Enforcement
                     * 
                     * Increment coupon usage if not already done by client-side verification.
                     * Webhooks act as a fallback for critical business logic.
                     */
                    const alreadyProcessed = existingOrder.paymentStatus === PAYMENT_STATUS.VERIFIED ||
                        existingOrder.paymentStatus === PAYMENT_STATUS.COMPLETED;

                    if (existingOrder.couponCode && !alreadyProcessed) {
                        await db.collection("coupons").updateOne(
                            { code: existingOrder.couponCode },
                            { $inc: { usageCount: 1 } }
                        );
                    }
                }
                break;
            }

            case "order.paid": {
                if (!payload?.payload?.order?.entity) {
                    return NextResponse.json({ success: false, error: "Invalid payload structure" }, { status: 400 });
                }
                const rOrderId = payload.payload.order.entity.id;
                console.log("Order ID:", rOrderId);

                const existingOrder = await db.collection("orders").findOne({ razorpayOrderId: rOrderId });

                if (existingOrder) {
                    const updateData: {
                        paymentStatus: string;
                        webhookReceived: boolean;
                        status?: string;
                    } = {
                        paymentStatus: PAYMENT_STATUS.COMPLETED,
                        webhookReceived: true
                    };

                    if (!existingOrder.status || existingOrder.status === ORDER_STATUS.PLACED) {
                        updateData.status = ORDER_STATUS.PLACED;
                    }

                    await db.collection("orders").updateOne(
                        { _id: existingOrder._id },
                        { $set: updateData }
                    );

                    const alreadyProcessed = existingOrder.paymentStatus === PAYMENT_STATUS.VERIFIED ||
                        existingOrder.paymentStatus === PAYMENT_STATUS.COMPLETED;

                    if (existingOrder.couponCode && !alreadyProcessed) {
                        await db.collection("coupons").updateOne(
                            { code: existingOrder.couponCode },
                            { $inc: { usageCount: 1 } }
                        );
                    }
                }
                break;
            }

            case "payment.failed": {
                /**
                 * PAYMENT FAILED EVENT
                 * 
                 * Triggered when payment attempt fails (insufficient funds, expired card, etc.)
                 * Updates order status to reflect payment failure
                 */
                if (!payload?.payload?.payment?.entity) {
                    return NextResponse.json({ success: false, error: "Invalid payload structure" }, { status: 400 });
                }
                const failedOrderId = payload.payload.payment.entity.order_id;
                
                const existingOrderFailed = await db.collection("orders").findOne({ razorpayOrderId: failedOrderId });
                
                if (existingOrderFailed) {
                    // Prevent regression: don't fail an order that has already been verified/completed
                    if (
                        existingOrderFailed.paymentStatus === PAYMENT_STATUS.COMPLETED ||
                        existingOrderFailed.paymentStatus === PAYMENT_STATUS.VERIFIED
                    ) {
                        break; // Already paid, ignore the late failed event
                    }

                    await db.collection("orders").updateOne(
                        { _id: existingOrderFailed._id },
                        {
                            $set: {
                                paymentStatus: PAYMENT_STATUS.FAILED, // Payment failure status
                                webhookReceived: true    // Flag indicating webhook processing
                            }
                        }
                    );
                }
                break;
            }

            default:
                /**
                 * UNHANDLED EVENTS
                 * 
                 * Log unhandled event types for monitoring and future development
                 * Does not return error - webhook should acknowledge receipt
                 */
                console.log("Unhandled event:", payload.event);
        }
    } catch (err) {
        /**
         * Webhook Processing Error
         * 
         * Handles errors during database operations or payload processing
         * Logs detailed error while returning generic message to Razorpay
         */
        console.error("Error handling webhook:", err);
        return NextResponse.json(
            { success: false, error: "Processing error" },
            { status: 500 } // Internal Server Error
        );
    }

    /**
     * Success Response
     * 
     * Acknowledges successful webhook processing to Razorpay
     * Razorpay will not retry webhooks that return 200 status
     */
    return NextResponse.json({ success: true });
}