import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import clientPromise from "@/lib/mongoConnect";

/**
 * POST /api/payment/verify
 * Verifies Razorpay payment authenticity and updates order status
 * 
 * This endpoint performs critical security validations after payment completion:
 * 1. Verifies Razorpay payment signature to prevent fraud
 * 2. Validates security hash to detect order tampering
 * 3. Updates order status to "placed" and marks payment as verified
 * 
 * @param {NextRequest} req - The incoming request containing payment verification data
 * 
 * @requestBody {Object} body - Payment verification payload
 * @requestBody {string} body.razorpay_order_id - Razorpay order ID
 * @requestBody {string} body.razorpay_payment_id - Razorpay payment ID
 * @requestBody {string} body.razorpay_signature - Razorpay payment signature for verification
 * @requestBody {string} body.securityHash - Security hash generated during order creation
 * @requestBody {string} body.orderId - Internal order identifier (Razorpay order ID)
 * 
 * @returns {Promise<NextResponse>}
 *   Success: { success: true }
 *   Invalid Signature: { success: false, error: "Invalid signature" } with 400 status
 *   Order Not Found: { success: false, error: "Order not found" } with 404 status
 *   Tampering Detected: { success: false, error: "Order tampering detected" } with 400 status
 * 
 * @security Critical security endpoint - validates payment authenticity and order integrity
 * 
 * @example
 * // Successful verification
 * POST /api/payment/verify
 * Request Body:
 * {
 *   "razorpay_order_id": "order_123456",
 *   "razorpay_payment_id": "pay_789012",
 *   "razorpay_signature": "a1b2c3d4...",
 *   "securityHash": "e5f6g7h8...",
 *   "orderId": "order_123456"
 * }
 * 
 * Response: 200
 * { "success": true }
 * 
 * @example
 * // Invalid signature (potential fraud)
 * POST /api/payment/verify → 400
 * { "success": false, "error": "Invalid signature" }
 * 
 * @example
 * // Order tampering detected
 * POST /api/payment/verify → 400
 * { "success": false, "error": "Order tampering detected" }
 * 
 * @warning This endpoint is critical for payment security - never disable validations
 * @note Double verification (signature + security hash) prevents both external and internal tampering
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
    await db.collection("orders").updateOne(
        { razorpayOrderId: orderId }, // Target order by Razorpay order ID
        {
            $set: {
                paymentStatus: "verified",        // Mark payment as manually verified
                razorpayPaymentId: razorpay_payment_id, // Store Razorpay payment reference
                verifiedAt: new Date(),          // Timestamp of verification
                status: "placed"                 // Move order to processing pipeline
            }
        }
    );

    /**
     * Success Response
     * Client can now safely confirm the order to the user
     */
    return NextResponse.json({ success: true });
}