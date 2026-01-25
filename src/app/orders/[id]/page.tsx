import React from "react";
import SectionHeader from "@/components/layout/SectionHeader";
import BackButton from "@/components/layout/BackButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import mongoose from "mongoose";
import OrderModel from "@/app/models/Orders";

/**
 * Order Item Type Definition
 * 
 * Represents individual line items within an order with complete pricing breakdown
 * Captures product configuration at time of purchase for accurate order history
 */
interface OrderItem {
    name: string;                             // Product name as displayed to customer
    size?: {                                  // Selected size option with price adjustment
        name: string;
        extraPrice: number;
    };
    extras?: {                                // Additional customizations/toppings
        name: string;
        extraPrice: number;
    }[];
    basePrice: number;                        // Base product price without modifications
    quantity?: number;                        // Quantity ordered (defaults to 1)
}

/**
 * Complete Order Type Definition
 * 
 * Comprehensive order record with financial breakdown and status tracking
 * Serves as the single source of truth for order details and audit trails
 */
interface Order {
    _id: string;                    // Unique MongoDB identifier
    userName: string;               // Customer's full name for delivery
    userEmail: string;              // Customer contact for notifications
    address: string;                // Complete delivery address
    cart: OrderItem[];              // Ordered items with configurations
    subtotal: number;               // Sum of all items before fees
    tax: number;                    // Calculated tax amount
    deliveryFee: number;            // Shipping/delivery charges
    total: number;                  // Final amount charged to customer
    razorpayOrderId: string;        // Payment gateway transaction reference
    createdAt: string;              // ISO timestamp of order placement
    status: string;                 // Current order lifecycle state
    paymentStatus: string;          // Financial transaction status
}

/**
 * Status Color Mapping Function
 * 
 * Provides consistent visual indicators for order states across the application
 * Uses Tailwind CSS classes for theming and accessibility compliance
 * 
 * @param {string} status - Current order status
 * @returns {string} Tailwind CSS color class for status display
 */
const getStatusColor = (status: string): string => {
    switch (status) {
        case "placed": return "text-amber-400";          // New order awaiting processing
        case "confirmed": return "text-blue-400";        // Restaurant accepted order
        case "preparing": return "text-purple-400";      // Kitchen actively preparing
        case "out_for_delivery": return "text-yellow-400"; // Order en route to customer
        case "completed": return "text-green-400";       // Successful delivery
        case "canceled": return "text-red-400";          // Order canceled (refund pending)
        default: return "text-amber-200";                // Fallback for unknown states
    }
};

/**
 * Status Label Formatter
 * 
 * Converts API status values to human-readable display labels
 * Handles snake_case to Title Case transformation with proper capitalization
 * 
 * @param {string} status - Raw status value from database
 * @returns {string} Formatted display label for UI
 */
const getStatusLabel = (status: string): string => {
    return status.replace(/_/g, " ")
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

/**
 * Currency Formatter for INR
 * 
 * Formats numerical amounts to Indian Rupees display format
 * Supports proper localization and currency symbols
 * 
 * @param {number} amount - Numerical amount to format
 * @returns {string} Locale-formatted currency string
 */
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * Date/Time Formatter
 * 
 * Converts ISO timestamps to comprehensive, human-readable format
 * Provides full contextual information including weekday and time
 * 
 * @param {string} dateString - ISO format date string
 * @returns {string} Formatted date-time string for display
 */
const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * OrderDetailPage Component
 * 
 * Comprehensive order inspection interface for administrators and customers
 * Provides complete order transparency with financial breakdown and item details
 * 
 * @component
 * @async
 * @param {Object} props - Component properties
 * @param {Promise<{id: string}>} props.params - Route parameters containing order ID
 */
export default async function OrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    /**
     * Route Parameter Extraction
     */
    const { id } = await params;

    /**
     * Data State Initialization
     */
    let order: Order | null = null;
    let error: string | null = null;

    /**
     * Order Data Fetcher
     */
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            error = "Unauthorized. Please log in.";
        } else {
            // Establish database connection
            if (mongoose.connection.readyState === 0) {
                await mongoose.connect(process.env.MONGO_URL!);
            }

            // Find order by ID in the database
            const orderDoc = await OrderModel.findById(id).lean() as any;

            if (!orderDoc) {
                order = null;
            } else {
                // Authorization check: Admin or Order Owner
                const isAdmin = session.user?.admin;
                const isOwner = orderDoc.userEmail === session.user?.email;

                if (!isAdmin && !isOwner) {
                    error = "Forbidden: You do not have permission to view this order.";
                } else {
                    // Convert MongoDB document to plain serializable object
                    order = JSON.parse(JSON.stringify(orderDoc));
                }
            }
        }
    } catch (err) {
        console.error("Error fetching order:", err);
        error = err instanceof Error ? err.message : "An unknown error occurred";
    }

    /**
     * Error State Render
     */
    if (error) {
        return (
            <div className="max-w-7xl mx-auto mt-10 px-4 py-12 text-amber-100">
                <SectionHeader subHeader="" mainHeader="Order Details" />
                <div className="bg-[#1a1108] p-6 rounded-lg shadow-lg text-center">
                    <p className="text-red-500 text-xl mb-4">Failed to load order details</p>
                    <p className="text-amber-300">{error}</p>
                </div>
            </div>
        );
    }

    /**
     * Not Found State Render
     */
    if (!order) {
        return (
            <div className="max-w-7xl mx-auto mt-10 px-4 py-12 text-amber-100">
                <SectionHeader subHeader="" mainHeader="Order Details" />
                <div className="bg-[#1a1108] p-6 rounded-lg shadow-lg text-center">
                    <p className="text-amber-300">Order not found</p>
                </div>
            </div>
        );
    }

    /**
     * Item Total Calculator
     */
    const itemTotals = order.cart.map(item => {
        const sizePrice = item.size?.extraPrice || 0;
        const extrasPrice = item.extras?.reduce((sum, extra) => sum + extra.extraPrice, 0) || 0;
        return item.basePrice + sizePrice + extrasPrice;
    });

    /**
     * Group identical items by their configuration
     * Creates a map of unique item configurations to their combined quantities
     */
    const groupedItems = order.cart.reduce((acc, item, idx) => {
        const extrasString = (item.extras ?? []).map(e => e.name).sort().join('|');
        const key = `${item.name}|${item.size?.name || ''}|${extrasString}`;

        if (!acc[key]) {
            acc[key] = {
                item,
                indices: [],
                quantity: 0,
                total: itemTotals[idx]
            };
        }
        acc[key].indices.push(idx);
        acc[key].quantity += item.quantity || 1;

        return acc;
    }, {} as Record<string, { item: OrderItem; indices: number[]; quantity: number; total: number }>);

    const groupedItemsArray = Object.values(groupedItems);

    /**
     * Main Component Render
     */
    return (
        <div className="max-w-7xl mx-auto mt-10 px-4 py-12 text-amber-100">
            {/* Back Button */}
            <div className="mb-6">
                <BackButton />
            </div>

            {/* Page Header with Order Reference */}
            <SectionHeader
                subHeader=""
                mainHeader={`Order: ${order.razorpayOrderId}`}
            />

            {/* Main Order Content Container */}
            <div className="bg-[#1a1108] p-6 rounded-lg shadow-lg">
                {/* Order Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Order #{order.razorpayOrderId}
                        </h1>
                        <p className="text-amber-300">
                            Placed on {formatDate(order.createdAt)}
                        </p>
                    </div>
                    {/* Order Total Display */}
                    <div className="text-xl font-bold">{formatCurrency(order.total)}</div>
                </div>

                {/* Order Items Section */}
                <div className="space-y-4 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                    {groupedItemsArray.map((group, idx) => (
                        <div
                            key={`${group.item.name}-${idx}-${group.item.size?.name || 'no-size'}`}
                            className="bg-[#2c1a0d] p-4 rounded-lg flex flex-col sm:flex-row justify-between gap-4"
                        >
                            {/* Item Details */}
                            <div className="flex-1">
                                <p className="font-semibold text-lg">
                                    {group.item.name}
                                    {group.quantity > 1 && <span className="text-amber-300 ml-2">x{group.quantity}</span>}
                                </p>
                                {/* Size Information */}
                                {group.item.size && (
                                    <p className="text-amber-300">
                                        Size: {group.item.size.name}
                                    </p>
                                )}
                                {/* Extras/Toppings List */}
                                {(group.item.extras?.length ?? 0) > 0 && (
                                    <div className="mt-2">
                                        <p className="font-semibold text-amber-300">Toppings:</p>
                                        <ul className="list-disc list-inside ml-2 text-amber-200">
                                            {group.item.extras!.map((extra, extraIdx) => (
                                                <li key={`${extra.name}-${extraIdx}`}>
                                                    {extra.name} ({formatCurrency(extra.extraPrice)})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            {/* Item Total */}
                            <div className="font-semibold text-lg">
                                {formatCurrency(group.total * group.quantity)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Information Grid: Delivery Details & Order Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Delivery Information Card */}
                    <div>
                        <h2 className="font-bold text-xl mb-4">Delivery Details</h2>
                        <div className="space-y-2">
                            <p><span className="font-semibold">Name:</span> {order.userName}</p>
                            <p><span className="font-semibold">Email:</span> {order.userEmail}</p>
                            <p><span className="font-semibold">Address:</span> {order.address}</p>
                        </div>
                    </div>

                    {/* Financial & Status Summary Card */}
                    <div>
                        <h2 className="font-bold text-xl mb-4">Payment & Order Summary</h2>
                        <div className="space-y-2">
                            {/* Financial Breakdown */}
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax:</span>
                                <span>{formatCurrency(order.tax)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery Fee:</span>
                                <span>{formatCurrency(order.deliveryFee)}</span>
                            </div>
                            {/* Order Total */}
                            <div className="border-t border-amber-800 pt-2 mt-2 flex justify-between font-semibold text-lg">
                                <span>Total:</span>
                                <span>{formatCurrency(order.total)}</span>
                            </div>
                            {/* Status Information */}
                            <div className="flex justify-between mt-4">
                                <span>Order Status:</span>
                                <span className={getStatusColor(order.status)}>
                                    {getStatusLabel(order.status)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Payment Status:</span>
                                <span className={
                                    order.paymentStatus === "refund_initiated"
                                        ? "text-primary"
                                        : order.paymentStatus === "paid"
                                            ? "text-green-500"
                                            : "text-amber-400"
                                }>
                                    {order.paymentStatus.replace(/_/g, " ")}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}