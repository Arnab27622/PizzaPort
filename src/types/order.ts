/**
 * This file defines everything related to Customer Orders.
 * It includes the status of the order (e.g., "Placed", "Preparing") 
 * and the specific details of what was bought.
 */

import mongoose from "mongoose";

/**
 * All possible stages an order can go through.
 */
export const ORDER_STATUS = {
    PLACED: 'placed',               // Order just submitted by the customer
    CONFIRMED: 'confirmed',         // Restaurant has seen and accepted the order
    PREPARING: 'preparing',         // The chefs are making the pizza
    OUT_FOR_DELIVERY: 'out_for_delivery', // The delivery person has picked it up
    COMPLETED: 'completed',         // Successfully delivered
    CANCELED: 'canceled',           // Order stopped by user or restaurant
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

/**
 * Represents a single item (e.g., one pizza) inside an order.
 */
export interface OrderItem {
    _id?: string;
    name: string;
    imageUrl?: string;
    basePrice: number;
    size?: { name: string; extraPrice: number }; // Selected size
    extras?: { name: string; extraPrice: number }[]; // Selected toppings
    quantity?: number; // How many of this item
}

/**
 * The complete structure of an Order on the website.
 */
export interface Order {
    _id: string;                    // Unique booking ID
    userName: string;               // Name of the customer
    userEmail: string;              // Contact email
    userImage?: string;             // Customer profile image (optional)
    address: string;                // Delivery location
    cart: OrderItem[];              // List of items bought
    subtotal: number;               // Cost of food only
    tax: number;                    // Tax amount
    deliveryFee: number;            // Delivery cost
    couponCode?: string;            // Discount code used (if any)
    discountAmount?: number;        // Money saved by coupon
    total: number;                  // Final amount paid
    status: OrderStatus | string;   // Current progress (e.g., "Preparing")
    paymentStatus: string;          // e.g., "Paid" or "Pending"
    razorpayOrderId: string;        // Payment reference ID
    createdAt: string;              // When the order was placed
    canceledAt?: string;            // When it was canceled (if applicable)
}

/**
 * How an order looks when it comes directly from the database.
 */
export interface DBOrder extends Omit<Order, "_id" | "createdAt"> {
    _id: mongoose.Types.ObjectId | string;
    createdAt: Date | string;
}

/**
 * Colors used in the UI to represent different stages of an order.
 */
export const STATUS_COLORS: Record<OrderStatus, string> = {
    placed: "text-amber-400",
    confirmed: "text-blue-400",
    preparing: "text-yellow-400",
    out_for_delivery: "text-purple-400",
    completed: "text-green-400",
    canceled: "text-red-400"
};

/**
 * Human-friendly names for each order status.
 */
export const STATUS_LABELS: Record<OrderStatus, string> = {
    placed: "Placed",
    confirmed: "Confirmed",
    preparing: "Preparing",
    out_for_delivery: "Out for Delivery",
    completed: "Completed",
    canceled: "Canceled"
};

/**
 * Numbers used to show progress on a progress bar.
 */
export const STATUS_RANK: Record<string, number> = {
    placed: 1,
    confirmed: 2,
    preparing: 3,
    out_for_delivery: 4,
    completed: 5,
    canceled: 6,
};

