// Orders.ts
import mongoose from "mongoose";

/**
 * Represents an order in the system.
 * @typedef {Object} Order
 * @property {string} userEmail - The email of the user who placed the order.
 * @property {string} userName - The name of the user who placed the order.
 * @property {string} address - The delivery address for the order.
 * @property {Array} cart - The items in the order cart.
 * @property {string} cart._id - The menu item ID.
 * @property {string} cart.name - The name of the menu item.
 * @property {number} cart.basePrice - The base price of the menu item.
 * @property {string} [cart.imageUrl] - The image URL of the menu item.
 * @property {Object} [cart.size] - The selected size option.
 * @property {string} cart.size.name - The name of the size.
 * @property {number} cart.size.extraPrice - The extra price for the size.
 * @property {Array} cart.extras - The selected extra ingredients.
 * @property {string} cart.extras.name - The name of the extra ingredient.
 * @property {number} cart.extras.extraPrice - The extra price for the ingredient.
 * @property {number} subtotal - The order subtotal amount.
 * @property {number} tax - The tax amount.
 * @property {number} deliveryFee - The delivery fee.
 * @property {number} total - The total order amount.
 * @property {string} paymentStatus - The payment status of the order.
 * @property {string} [razorpayOrderId] - Razorpay order ID for payment processing.
 * @property {string} [razorpayPaymentId] - Razorpay payment ID for payment processing.
 * @property {string} [securityHash] - Security hash for payment verification.
 * @property {boolean} [webhookReceived] - Whether payment webhook was received.
 * @property {Date} [verifiedAt] - When the payment was verified.
 * @property {string} status - The current status of the order.
 * @property {Date} [canceledAt] - When the order was canceled.
 * @property {Date} createdAt - When the order was created.
 * @property {Date} updatedAt - When the order was last updated.
 */
const OrderSchema = new mongoose.Schema(
    {
        userEmail: { type: String, required: true },
        userName: { type: String, required: true },
        address: { type: String, required: true },
        cart: [
            {
                _id: { type: String, required: true },
                name: { type: String, required: true },
                basePrice: { type: Number, required: true },
                imageUrl: { type: String },
                size: {
                    name: String,
                    extraPrice: Number,
                },
                extras: [
                    {
                        name: String,
                        extraPrice: Number,
                    },
                ],
            },
        ],
        subtotal: Number,
        tax: Number,
        deliveryFee: Number,
        total: Number,
        paymentStatus: {
            type: String,
            enum: ["pending", "verified", "completed", "failed", "refund_initiated"],
            default: "pending"
        },
        razorpayOrderId: String,
        razorpayPaymentId: String,
        securityHash: String,
        webhookReceived: Boolean,
        verifiedAt: Date,
        status: {
            type: String,
            enum: ["placed", "confirmed", "preparing", "out_for_delivery", "completed", "canceled"],
            default: "placed"
        },
        canceledAt: Date
    },
    { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);