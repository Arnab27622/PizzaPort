import React from "react";
import SectionHeader from "@/components/layout/SectionHeader";

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
 * 
 * @features
 * - Complete order financial breakdown (subtotal, tax, fees, total)
 * - Detailed item configuration display (sizes, extras, quantities)
 * - Real-time order status and payment status tracking
 * - Customer and delivery information display
 * - Responsive design for all device sizes
 * - Comprehensive error handling and loading states
 * 
 * @security
 * - Server-side data fetching prevents client-side data exposure
 * - Environment variable usage for API endpoint construction
 * - Input sanitization through Next.js route parameters
 * - No sensitive operations performed on client-side
 * 
 * @performance
 * - Static generation with incremental revalidation (ISR)
 * - Efficient data fetching with 30-second cache revalidation
 * - Optimized rendering with conditional display logic
 * - Minimal client-side JavaScript bundle
 * 
 * @user_experience
 * - Clear visual hierarchy with section-based layout
 * - Status-based color coding for quick scanning
 * - Comprehensive error states with recovery options
 * - Mobile-optimized responsive design
 * - Accessible color contrast and text sizing
 * 
 * @example
 * // Renders order details for order ID 'abc123'
 * <OrderDetailPage params={Promise.resolve({ id: 'abc123' })} />
 */
export default async function OrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    /**
     * Route Parameter Extraction
     * 
     * Safely extracts order ID from URL parameters for data fetching
     * Uses Next.js async params handling for App Router compatibility
     */
    const { id } = await params;

    /**
     * Data State Initialization
     * 
     * @variable order - Complete order data or null if not found
     * @variable error - Error message for failed data fetching
     */
    let order: Order | null = null;
    let error: string | null = null;

    /**
     * Order Data Fetcher
     * 
     * Retrieves specific order details from API with comprehensive error handling
     * Implements Incremental Static Regeneration for optimal performance
     * 
     * @async
     * @function
     * @throws {Error} When API response is not OK or network fails
     */
    try {
        const res = await fetch(
            `${process.env.NEXTAUTH_URL || ""}/api/orders/${id}`,
            {
                next: {
                    // Incremental Static Regeneration: Revalidate cache every 30 seconds
                    revalidate: 30,
                },
            }
        );

        if (!res.ok) {
            throw new Error(`Failed to load order: ${res.status} ${res.statusText}`);
        }

        order = await res.json();
    } catch (err) {
        console.error("Error fetching order:", err);
        error = err instanceof Error ? err.message : "An unknown error occurred";
    }

    /**
     * Error State Render
     * 
     * Displays user-friendly error message with recovery option
     * Provides clear feedback and actionable next steps
     */
    if (error) {
        return (
            <div className="max-w-7xl mx-auto mt-10 px-4 py-12 text-amber-100">
                <SectionHeader subHeader="" mainHeader="Order Details" />
                <div className="bg-[#1a1108] p-6 rounded-lg shadow-lg text-center">
                    <p className="text-red-500 text-xl mb-4">Failed to load order details</p>
                    <p className="text-amber-300">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-amber-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    /**
     * Not Found State Render
     * 
     * Handles cases where order ID is valid but no order exists
     * Prevents confusing empty states with clear messaging
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
     * 
     * Computes individual item totals including base price, size upgrades, and extras
     * Ensures accurate price display matching original checkout calculations
     * 
     * @returns {number[]} Array of calculated totals for each cart item
     */
    const itemTotals = order.cart.map(item => {
        const sizePrice = item.size?.extraPrice || 0;
        const extrasPrice = item.extras?.reduce((sum, extra) => sum + extra.extraPrice, 0) || 0;
        return item.basePrice + sizePrice + extrasPrice;
    });

    /**
     * Main Component Render
     * 
     * Implements comprehensive order detail interface with:
     * - Order header with metadata and total
     * - Detailed item breakdown with customizations
     * - Customer and delivery information
     * - Complete financial summary
     * - Status and payment tracking
     */
    return (
        <div className="max-w-7xl mx-auto mt-10 px-4 py-12 text-amber-100">
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
                    {order.cart.map((item, idx) => (
                        <div
                            key={`${item.name}-${idx}-${item.size?.name || 'no-size'}`}
                            className="bg-[#2c1a0d] p-4 rounded-lg flex flex-col sm:flex-row justify-between gap-4"
                        >
                            {/* Item Details */}
                            <div className="flex-1">
                                <p className="font-semibold text-lg">{item.name}</p>
                                {/* Size Information */}
                                {item.size && (
                                    <p className="text-amber-300">
                                        Size: {item.size.name}
                                    </p>
                                )}
                                {/* Extras/Toppings List */}
                                {(item.extras?.length ?? 0) > 0 && (
                                    <div className="mt-2">
                                        <p className="font-semibold text-amber-300">Toppings:</p>
                                        <ul className="list-disc list-inside ml-2 text-amber-200">
                                            {item.extras!.map((extra, extraIdx) => (
                                                <li key={`${extra.name}-${extraIdx}`}>
                                                    {extra.name} ({formatCurrency(extra.extraPrice)})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {/* Quantity Display */}
                                {item.quantity && item.quantity > 1 && (
                                    <p className="text-amber-300 mt-2">
                                        Quantity: {item.quantity}
                                    </p>
                                )}
                            </div>
                            {/* Item Total */}
                            <div className="font-semibold text-lg">
                                {formatCurrency(itemTotals[idx] * (item.quantity || 1))}
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