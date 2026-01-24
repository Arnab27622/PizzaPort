"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LoadingSpinner from "@/components/icons/LoadingSpinner";
import BackButton from "@/components/layout/BackButton";

/**
 * Order Item Interface
 * 
 * Represents individual products within a customer order
 * Contains essential product information for order display and tracking
 */
interface OrderItem {
    name: string;              // Product name as displayed at time of purchase
    imageUrl?: string;         // Product image for visual order identification
}

/**
 * Complete Order Interface
 * 
 * Comprehensive order record for customer order history display
 * Contains order metadata, status information, and item details
 */
interface Order {
    _id: string;                    // Unique MongoDB identifier
    razorpayOrderId: string;        // Payment gateway transaction reference
    total: number;                  // Final order amount in INR
    createdAt: string;              // ISO timestamp of order placement
    status: string;                 // Current order lifecycle state
    paymentStatus: string;          // Financial transaction status
    cart: OrderItem[];              // Ordered products with details
}

/**
 * Order Status Color Mapper
 * 
 * Provides consistent visual indicators for order states across the application
 * Uses Tailwind CSS classes for theming and accessibility compliance
 * 
 * @param {string} status - Current order status from database
 * @returns {string} Tailwind CSS color class for status display
 */
const getStatusColor = (status: string): string => {
    switch (status) {
        case "placed": return "text-amber-400";          // New order awaiting processing
        case "confirmed": return "text-blue-400";        // Restaurant accepted order
        case "preparing": return "text-purple-400";      // Kitchen actively preparing
        case "out_for_delivery": return "text-yellow-400"; // Order en route to customer
        case "completed": return "text-green-400";       // Successful delivery
        case "canceled": return "text-red-400";          // Order canceled
        default: return "text-amber-200";                // Fallback for unknown states
    }
};

/**
 * Currency Formatter for INR
 * 
 * Formats numerical amounts to Indian Rupees display format
 * Supports proper localization and consistent currency display
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
 * Date Formatter
 * 
 * Converts ISO timestamps to comprehensive, human-readable date format
 * Provides full contextual information including weekday
 * 
 * @param {string} dateString - ISO format date string
 * @returns {string} Formatted date string for display
 */
const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

/**
 * OrdersPage Component
 * 
 * Customer-facing order history and tracking interface
 * Provides comprehensive order management with real-time status updates
 * 
 * @component
 * @features
 * - Complete order history with chronological sorting
 * - Real-time order status tracking with visual indicators
 * - Order detail navigation with clickable order cards
 * - Empty state with call-to-action for new customers
 * - Comprehensive error handling with retry mechanism
 * - Responsive design for all device sizes
 * 
 * @security
 * - Session-gated access prevents unauthorized order viewing
 * - Automatic redirection to login for unauthenticated users
 * - User-specific data filtering through protected API routes
 * - No sensitive data exposure in client-side rendering
 * 
 * @performance
 * - Memoized calculations prevent unnecessary re-renders
 * - Efficient image loading with Next.js optimization
 * - Conditional rendering optimizes bundle size
 * - Optimized sorting with useMemo dependency management
 * 
 * @user_experience
 * - Intuitive order cards with clear status indicators
 * - Visual product representation with images
 * - Comprehensive loading and error states
 * - Accessible interface with keyboard navigation
 * - Empty state guidance for new customers
 * 
 * @example
 * // Renders complete order history for authenticated user
 * <OrdersPage />
 */
export default function OrdersPage() {
    /**
     * Authentication & Session Management
     * 
     * Secures access to user-specific order data and manages authentication state
     * Required for personalized order history and privacy protection
     */
    const { status } = useSession();
    const router = useRouter();

    /**
     * Component State Management
     * 
     * @state orders - Complete list of user orders from API
     * @state loading - Tracks initial data loading and authentication states
     * @state error - Stores error messages for user feedback
     * @state retryCount - Enables retry mechanism for failed data fetches
     */
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [retryCount, setRetryCount] = useState(0);

    /**
     * Orders Data Fetcher
     * 
     * Retrieves user-specific order history from protected API endpoint
     * Implements comprehensive error handling and state management
     * 
     * @async
     * @function
     * @throws {Error} When API response is not OK or network fails
     */
    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const response = await fetch("/api/user-orders");

            if (!response.ok) {
                throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setError("Failed to load orders. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Authentication & Data Fetching Effect
     * 
     * Controls data fetching based on authentication status
     * Redirects unauthenticated users to login page automatically
     * Implements retry mechanism through dependency tracking
     */
    useEffect(() => {
        if (status === "authenticated") {
            fetchOrders();
        } else if (status === "unauthenticated") {
            setLoading(false);
            router.push("/login");
        }
    }, [status, router, fetchOrders, retryCount]);

    /**
     * Order Detail Navigation Handler
     * 
     * Handles order card clicks to navigate to detailed order view
     * Provides intuitive drill-down functionality for order inspection
     * 
     * @function
     * @param {string} orderId - Payment gateway order ID for navigation
     */
    const handleOrderClick = useCallback((orderId: string) => {
        router.push(`/user-orders/${orderId}`);
    }, [router]);

    /**
     * Data Fetching Retry Handler
     * 
     * Enables user-initiated retry for failed data fetching operations
     * Updates retry count to trigger useEffect dependency change
     */
    const handleRetry = useCallback(() => {
        setRetryCount(prev => prev + 1);
    }, []);

    /**
     * Empty State Navigation Handler
     * 
     * Guides new customers to menu browsing when no orders exist
     * Provides clear call-to-action for order creation
     */
    const handleBrowseMenu = useCallback(() => {
        router.push("/menu");
    }, [router]);

    /**
     * Orders Sorting Hook
     * 
     * Sorts orders by creation date (newest first) for optimal user experience
     * Memoized to prevent unnecessary re-sorting on every render
     * 
     * @returns {Order[]} Chronologically sorted array of orders
     */
    const sortedOrders = useMemo(() => {
        return [...orders].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }, [orders]);

    /**
     * Group identical items in an order by name
     * Combines quantities of the same item name
     * 
     * @function groupOrderItems
     * @param {OrderItem[]} cartItems - Items to group
     * @returns {Array<{ name: string; quantity: number }>} Grouped items with quantities
     */
    const groupOrderItems = useCallback((cartItems: Order["cart"]) => {
        return cartItems.reduce((acc, item) => {
            const existing = acc.find(g => g.name === item.name);
            if (existing) {
                existing.quantity += 1;
            } else {
                acc.push({ name: item.name, quantity: 1 });
            }
            return acc;
        }, [] as Array<{ name: string; quantity: number }>);
    }, []);

    /**
     * Loading State
     * 
     * Displays loading spinner during authentication and data fetching
     * Provides clear feedback during initial load operations
     */
    if (loading) {
        return (
            <div className="max-w-7xl mx-auto mt-10 px-4 py-12 text-amber-100 min-h-[80vh] flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold mb-8 text-primary heading-border">Your Orders</h1>
                <LoadingSpinner size="lg" color="text-primary" className="mb-4" />
                <p className="text-amber-300">Loading your orders...</p>
            </div>
        );
    }

    /**
     * Error State
     * 
     * Displays user-friendly error message with recovery option
     * Handles API failures and network errors gracefully
     */
    if (error) {
        return (
            <div className="max-w-7xl mx-auto mt-10 px-4 py-12 text-amber-100">
                <h1 className="text-3xl font-bold heading-border underline mb-6">Your Orders</h1>
                <div className="text-center py-12">
                    <p className="text-xl mb-4 text-red-400">{error}</p>
                    <button
                        onClick={handleRetry}
                        className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    /**
     * Main Component Render
     * 
     * Implements comprehensive order history interface with:
     * - Page header and order count display
     * - Empty state guidance for new customers
     * - Interactive order cards with detailed information
     * - Responsive layout for all device sizes
     */
    return (
        <div className="max-w-7xl min-h-[83vh] mx-auto mt-10 px-4 py-12 text-amber-100">
            {/* Back Button - Responsive positioning */}
            <div className="mb-6">
                <BackButton />
            </div>

            {/* Page Header */}
            <h1 className="text-3xl font-bold heading-border underline mb-6">Your Orders</h1>

            {/* Empty State - No Orders */}
            {sortedOrders.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-xl mb-4 text-amber-300">You haven&apos;t placed any orders yet</p>
                    <button
                        onClick={handleBrowseMenu}
                        className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors"
                    >
                        Browse Menu
                    </button>
                </div>
            ) : (
                /* Orders List - Interactive Order Cards */
                <div className="space-y-6">
                    {sortedOrders.map((order) => {
                        // Format status text for display (Title Case with spaces)
                        const statusText = order.status
                            ? order.status.charAt(0).toUpperCase() + order.status.slice(1).replace(/_/g, " ")
                            : "Unknown";

                        return (
                            /* Individual Order Card */
                            <div
                                key={order._id}
                                className="bg-[#1a1108] border border-amber-900 rounded-lg p-6 hover:bg-[#2c1a0d] transition-colors cursor-pointer"
                                onClick={() => handleOrderClick(order.razorpayOrderId)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    // Enable keyboard navigation for accessibility
                                    if (e.key === "Enter" || e.key === " ") {
                                        handleOrderClick(order.razorpayOrderId);
                                    }
                                }}
                                aria-label={`View order details for order ${order.razorpayOrderId}`}
                            >
                                {/* Order Header - Basic Information */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                    {/* Order Identity Section */}
                                    <div className="flex items-center gap-4">
                                        {/* Primary Product Image */}
                                        {order.cart[0]?.imageUrl && (
                                            <div className="w-16 h-16 relative shrink-0">
                                                <Image
                                                    src={order.cart[0].imageUrl}
                                                    alt={order.cart[0].name}
                                                    fill
                                                    className="object-cover rounded"
                                                    sizes="64px"
                                                />
                                            </div>
                                        )}
                                        {/* Order Metadata */}
                                        <div>
                                            <h2 className="text-lg font-semibold">
                                                Order: #{order.razorpayOrderId.slice(0, 8)}
                                            </h2>
                                            <p className="text-sm text-amber-300">
                                                {formatDate(order.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Order Summary Section */}
                                    <div className="mt-4 md:mt-0 flex flex-col items-end">
                                        <div className="text-xl font-bold">{formatCurrency(order.total)}</div>
                                        <div className={`text-sm font-semibold ${getStatusColor(order.status)}`}>
                                            {statusText}
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items Preview - Grouped by identical items */}
                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                    {groupOrderItems(order.cart).slice(0, 3).map((item, idx) => (
                                        <span key={idx} className="text-sm bg-amber-900 px-2 py-1 rounded">
                                            {item.name}{item.quantity > 1 && <span className="text-amber-300 ml-1">x{item.quantity}</span>}
                                        </span>
                                    ))}
                                    {/* Overflow Indicator */}
                                    {groupOrderItems(order.cart).length > 3 && (
                                        <span className="text-sm bg-amber-900 px-2 py-1 rounded">
                                            +{groupOrderItems(order.cart).length - 3} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}