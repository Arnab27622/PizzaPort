import mongoose from "mongoose";

export const ORDER_STATUS = {
    PLACED: 'placed',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    COMPLETED: 'completed',
    CANCELED: 'canceled',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

export interface OrderItem {
    _id?: string;                              // Unique MongoDB identifier for the order item
    name: string;                             // Product name at time of order
    imageUrl?: string;                        // Optional product image URL
    basePrice: number;                        // Base price without modifications
    size?: { name: string; extraPrice: number }; // Selected size with price adjustment
    extras?: { name: string; extraPrice: number }[]; // Additional toppings/modifications
    quantity?: number;                        // Quantity ordered (defaults to 1 if undefined)
}


export interface Order {
    _id: string;                    // Unique MongoDB identifier for the order
    userName: string;               // Customer's full name for delivery
    userEmail: string;              // Customer contact for notifications
    address: string;                // Complete delivery address
    cart: OrderItem[];              // Ordered items with configurations
    subtotal: number;               // Sum of all items before fees
    tax: number;                    // Calculated tax amount
    deliveryFee: number;            // Shipping/delivery charges
    couponCode?: string;            // Applied coupon code
    discountAmount?: number;        // Discount amount from coupon
    total: number;                  // Final order total in INR
    status: OrderStatus | string;                 // Current order status
    paymentStatus: string;          // Financial transaction status
    razorpayOrderId: string;        // Payment gateway transaction reference
    createdAt: string;              // ISO timestamp of order placement
    canceledAt?: string;            // Optional timestamp for order cancellation
}

/**
 * Database Order Type Definition
 * Represents the order document as it comes from the database via lean()
 */
export interface DBOrder extends Omit<Order, "_id" | "createdAt"> {
    _id: mongoose.Types.ObjectId | string;
    createdAt: Date | string;
}


export const STATUS_COLORS: Record<OrderStatus, string> = {
    placed: "text-amber-400",           // New order awaiting confirmation
    confirmed: "text-blue-400",         // Restaurant has accepted order
    preparing: "text-yellow-400",       // Kitchen is preparing food
    out_for_delivery: "text-purple-400", // Order is with delivery personnel
    completed: "text-green-400",        // Order successfully delivered
    canceled: "text-red-400"            // Order canceled (with refund processing)
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
    placed: "Placed",
    confirmed: "Confirmed",
    preparing: "Preparing",
    out_for_delivery: "Out for Delivery",
    completed: "Completed",
    canceled: "Canceled"
};

export const STATUS_RANK: Record<string, number> = {
    placed: 1,
    confirmed: 2,
    preparing: 3,
    out_for_delivery: 4,
    completed: 5,
    canceled: 6, // Terminal state
};
