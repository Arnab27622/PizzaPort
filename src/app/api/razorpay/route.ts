import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoConnect";
import crypto from 'crypto';
import { CartProduct } from "@/components/AppContext";
import { z } from "zod";

const RazorpayOrderSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    address: z.string().min(5, 'Address is too short'),
    cart: z.array(z.any()).min(1, 'Cart is empty'),
});

/**
 * Razorpay Order Response Interface
 * Defines the structure of the response from Razorpay order creation API
 */
interface RazorpayOrderResponse {
    id: string;                     // Razorpay order ID
    amount: number;                 // Order amount in smallest currency unit (paise for INR)
    currency: string;               // Currency code (e.g., "INR")
    [key: string]: unknown;         // Allow for additional Razorpay response fields
}

/**
 * POST /api/payment/create-order
 * Creates a Razorpay payment order and stores order details in database
 * 
 * This endpoint handles the initial payment order creation flow:
 * 1. Validates user data and cart contents
 * 2. Calculates order totals (subtotal, tax, delivery)
 * 3. Creates Razorpay payment order
 * 4. Generates security hash for cart integrity
 * 5. Stores order in MongoDB for future reference
 * 
 * @param {Request} req - The incoming request containing order details in JSON format
 * 
 * @requestBody {Object} payload - Order creation payload
 * @requestBody {string} payload.name - Customer's full name
 * @requestBody {string} payload.email - Customer's email address
 * @requestBody {CartProduct[]} payload.cart - Array of cart products with pricing details
 * @requestBody {string} payload.address - Delivery address
 * 
 * @returns {Promise<NextResponse>}
 *   Success: { success: true, order: OrderData, razorpayOrderId: string, amount: number, securityHash: string }
 *   Client Error: { success: false, error: string } with 400 status
 *   Server Error: { success: false, error: string } with 500 status
 * 
 * @throws {Error} Razorpay API errors, database connection errors, calculation errors
 * 
 * @example
 * // Successful order creation
 * POST /api/payment/create-order
 * Request Body:
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "cart": [...],
 *   "address": "123 Main St, City, Country"
 * }
 * 
 * Response: 200
 * {
 *   "success": true,
 *   "order": { ... },
 *   "razorpayOrderId": "order_123456",
 *   "amount": 25000,
 *   "securityHash": "a1b2c3d4..."
 * }
 * 
 * @example
 * // Missing required fields
 * POST /api/payment/create-order → 400
 * {
 *   "success": false,
 *   "error": "Missing user data"
 * }
 * 
 * @example
 * // Razorpay API failure
 * POST /api/payment/create-order → 500
 * {
 *   "success": false,
 *   "error": "Failed to create Razorpay order"
 * }
 */
export async function POST(req: Request) {
    /**
     * Establish database connection
     * Connection is established early to fail fast if database is unavailable
     */
    const clientDB = await clientPromise;

    /**
     * Parse request payload containing order details
     * Expected to contain user information, cart items, and delivery address
     */
    const payload = await req.json();


    /**
     * Input Validation
     * Check for required user identification and order details
     * Uses Zod for comprehensive schema validation
     */
    const validation = RazorpayOrderSchema.safeParse(payload);

    if (!validation.success) {
        return NextResponse.json(
            { success: false, error: validation.error.issues[0].message },
            { status: 400 },
        );
    }

    const { name, email, cart, address } = validation.data;

    /**
     * Order Amount Calculation
     * Recalculate all amounts server-side to prevent client-side tampering
     * This ensures pricing integrity and security
     */
    const subtotal = cart.reduce((sum: number, item: CartProduct) => {
        // Calculate item total including size and extra ingredient options
        const sizePrice = item.size?.extraPrice || 0;
        const extrasPrice = item.extras?.reduce((s: number, e) => s + e.extraPrice, 0) || 0;
        return sum + item.basePrice + sizePrice + extrasPrice;
    }, 0);

    // Apply tax (5%) and conditional delivery fee
    const tax = Math.round(subtotal * 0.05); // 5% tax rate
    const deliveryFee = subtotal >= 400 ? 0 : 50; // Free delivery for orders above 400
    const total = subtotal + tax + deliveryFee;

    /**
     * Initialize Razorpay client
     * Uses environment variables for API credentials
     * Key ID and Secret Key are required for Razorpay API authentication
     */
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_SECRET_KEY!,
    });

    let order: RazorpayOrderResponse;

    /**
     * Razorpay Order Creation
     * Creates a payment order in Razorpay system
     */
    try {
        order = (await razorpay.orders.create({
            amount: Math.round(total * 100), // Convert to paise (smallest INR unit)
            currency: "INR",                 // Indian Rupees
            receipt: `receipt_${Date.now()}`, // Unique receipt identifier
            payment_capture: true,           // Auto-capture payment after authorization
        }) as unknown) as RazorpayOrderResponse;
    } catch (err) {
        /**
         * Handle Razorpay API errors
         * This could be due to invalid credentials, network issues, or API limits
         */
        console.error("Razorpay order creation failed:", err);
        return NextResponse.json(
            { success: false, error: "Failed to create Razorpay order" },
            { status: 500 }, // Internal Server Error
        );
    }

    /**
     * Security Hash Generation
     * Creates a hash to verify cart integrity during payment verification
     * Prevents tampering with cart contents between order creation and payment
     */
    const securityHash = crypto
        .createHash("sha256")
        .update(JSON.stringify(cart) + total)
        .digest("hex");

    /**
     * Order Data Preparation
     * Comprehensive order object for database storage
     * Contains all necessary information for order processing and fulfillment
     */
    const orderData = {
        userName: name,              // Customer name
        userEmail: email,            // Customer email
        address,                     // Delivery address
        cart,                        // Complete cart with product details
        subtotal,                    // Calculated subtotal
        tax,                         // Calculated tax amount
        deliveryFee,                 // Delivery fee (0 for free delivery)
        total,                       // Final total amount
        razorpayOrderId: order.id,   // Razorpay's order identifier
        securityHash,                // Security hash for cart verification
        paymentStatus: "pending",    // Initial payment status
        createdAt: new Date(),       // Order creation timestamp
    };

    /**
     * Database Storage
     * Save order details to MongoDB for record keeping and future processing
     */
    try {
        const db = clientDB.db();
        const result = await db.collection("orders").insertOne(orderData);

        /**
         * Success Response
         * Returns order details including database ID and Razorpay information
         * Frontend uses this data to initialize Razorpay checkout
         */
        return NextResponse.json({
            success: true,
            order: { ...orderData, _id: result.insertedId }, // Include MongoDB document ID
            razorpayOrderId: order.id,     // Razorpay order ID for payment processing
            amount: order.amount,          // Amount in paise for Razorpay checkout
            securityHash,                  // Security hash for client-side verification
        });
    } catch (err) {
        /**
         * Handle database insertion errors
         * Order creation in Razorpay succeeded but database storage failed
         * This requires manual reconciliation
         */
        console.error("Mongo insert failed:", err);
        return NextResponse.json(
            { success: false, error: "Order insertion failed" },
            { status: 500 }, // Internal Server Error
        );
    }
}