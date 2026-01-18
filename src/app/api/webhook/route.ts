import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import clientPromise from "@/lib/mongoConnect";

/**
 * Razorpay Webhook Secret from environment variables
 * Used to verify webhook request authenticity
 */
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET!;

/**
 * POST /api/webhooks/razorpay
 * Handles Razorpay webhook events for real-time payment status updates
 * 
 * This endpoint processes asynchronous payment notifications from Razorpay:
 * - Payment captured (successful payments)
 * - Payment failed (failed payment attempts)
 * - Other payment lifecycle events
 * 
 * Webhooks provide reliable payment status updates independent of client-side verification.
 * 
 * @param {NextRequest} req - The incoming webhook request with raw body
 * 
 * @headers {string} x-razorpay-signature - HMAC signature for webhook verification
 * 
 * @returns {Promise<NextResponse>}
 *   Success: { success: true }
 *   Missing Signature: { success: false, error: "Missing signature" } with 400 status
 *   Signature Mismatch: { success: false, error: "Signature mismatch" } with 400 status
 *   Processing Error: { success: false, error: "Processing error" } with 500 status
 * 
 * @security Webhook verification is critical - prevents spoofed payment notifications
 * 
 * @example
 * // Webhook payload structure
 * {
 *   "event": "payment.captured",
 *   "payload": {
 *     "payment": {
 *       "entity": {
 *         "order_id": "order_123456",
 *         "status": "captured"
 *       }
 *     }
 *   }
 * }
 * 
 * @note Webhooks provide backup verification if client-side verification fails
 * @important Always verify webhook signatures to prevent fake payment notifications
 */
export async function POST(req: NextRequest) {
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
     */
    const expectedSignature = crypto
        .createHmac("sha256", WEBHOOK_SECRET) // Use webhook-specific secret
        .update(rawBody)                      // Use exact raw request body
        .digest("hex");                       // Generate HMAC hex digest

    /**
     * Signature Comparison
     * If signatures don't match, the webhook may be spoofed
     */
    if (signature !== expectedSignature) {
        return NextResponse.json(
            { success: false, error: "Signature mismatch" },
            { status: 400 } // Bad Request - potential webhook spoofing
        );
    }

    /**
     * PAYLOAD PROCESSING
     * 
     * Only reached if webhook signature is valid
     * Parse the JSON payload and handle different event types
     */
    const payload = JSON.parse(rawBody);
    const client = await clientPromise.connect();
    const db = client.db();

    /**
     * Webhook Event Handler
     * Processes different Razorpay webhook events with appropriate business logic
     */
    try {
        switch (payload.event) {
            case "payment.captured":
                /**
                 * PAYMENT CAPTURED EVENT
                 * 
                 * Triggered when Razorpay successfully captures the payment
                 * This is the final confirmation of successful payment
                 */
                const payment = payload.payload.payment.entity;
                await db.collection("orders").updateOne(
                    { razorpayOrderId: payment.order_id }, // Find order by Razorpay order ID
                    {
                        $set: {
                            paymentStatus: "completed", // Final payment status
                            webhookReceived: true       // Flag indicating webhook processing
                        }
                    }
                );
                break;

            case "payment.failed":
                /**
                 * PAYMENT FAILED EVENT
                 * 
                 * Triggered when payment attempt fails (insufficient funds, expired card, etc.)
                 * Updates order status to reflect payment failure
                 */
                await db.collection("orders").updateOne(
                    { razorpayOrderId: payload.payload.payment.entity.order_id },
                    {
                        $set: {
                            paymentStatus: "failed", // Payment failure status
                            webhookReceived: true    // Flag indicating webhook processing
                        }
                    }
                );
                break;

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