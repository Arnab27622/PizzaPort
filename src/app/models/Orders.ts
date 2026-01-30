/**
 * This file defines the "Order" model.
 * An Order records everything about a customer's purchase, including what they bought,
 * where it should be delivered, and the payment status.
 */

import mongoose from "mongoose";
import { ORDER_STATUS } from "@/types/order";
import { PAYMENT_STATUS } from "@/types/payment";

/**
 * OrderSchema defines the structure of an order in our database.
 */
const OrderSchema = new mongoose.Schema(
    {
        // Customer Information
        userEmail: { type: String, required: true }, // The email of the person who placed the order
        userName: { type: String, required: true },  // The name of the person who placed the order
        address: { type: String, required: true },   // Where the pizza should be delivered

        // Items in the Cart
        cart: [
            {
                _id: { type: String, required: true },       // Unique ID for the menu item
                name: { type: String, required: true },      // Name of the item
                basePrice: { type: Number, required: true },  // Price before any extras
                imageUrl: { type: String },                  // Photo of the item (optional)
                size: {
                    name: String,       // Selected size (e.g., "Large")
                    extraPrice: Number, // Extra cost for the size
                },
                extras: [
                    {
                        name: String,       // Selected topping (e.g., "Extra Cheese")
                        extraPrice: Number, // Extra cost for the topping
                    },
                ],
            },
        ],

        // Pricing Summary
        subtotal: Number,       // Sum of all items and extras
        tax: Number,            // Calculated tax amount
        deliveryFee: Number,    // Cost for delivery
        couponCode: String,     // The discount code used (if any)
        discountAmount: Number, // Total money saved by the coupon
        total: Number,          // Final amount the user paid (subtotal + tax + delivery - discount)

        // Payment Details
        paymentStatus: {
            type: String,
            enum: Object.values(PAYMENT_STATUS),
            default: PAYMENT_STATUS.PENDING // Status can be PENDING, COMPLETED, or FAILED
        },
        razorpayOrderId: String,   // Unique ID from the payment provider (Razorpay)
        razorpayPaymentId: String, // ID for the specific payment transaction
        securityHash: String,      // Used to verify that the payment info hasn't been tampered with
        webhookReceived: Boolean,  // Whether we received confirmation from Razorpay's server
        verifiedAt: Date,           // When the payment was officially confirmed

        // Order Progress
        status: {
            type: String,
            enum: Object.values(ORDER_STATUS),
            default: ORDER_STATUS.PLACED // Status can be PLACED, PREPARING, OUT_FOR_DELIVERY, etc.
        },
        canceledAt: Date // If the order was canceled, we record the time here
    },
    { timestamps: true } // Automatically adds "createdAt" and "updatedAt"
);

/**
 * The Order model represents the "orders" collection in MongoDB.
 */
export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
