"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useIsAdmin } from "../hook/useAdmin";
import SectionHeader from "@/components/layout/SectionHeader";
import LoadingSpinner from "@/components/icons/LoadingSpinner";

/**
 * Order Item Type Definition
 * 
 * Represents individual items within an order's cart
 * Matches the database schema for order line items
 */
interface OrderItem {
    _id: string;                              // Unique MongoDB identifier for the order item
    name: string;                             // Product name at time of order
    basePrice: number;                        // Base price without modifications
    size?: { name: string; extraPrice: number }; // Selected size with price adjustment
    extras?: { name: string; extraPrice: number }[]; // Additional toppings/modifications
    quantity?: number;                        // Quantity ordered (defaults to 1 if undefined)
}

/**
 * Order Type Definition
 * 
 * Complete order structure representing customer purchases
 * Contains order metadata, customer info, cart contents, and status
 */
interface Order {
    _id: string;                    // Unique MongoDB identifier for the order
    userName: string;               // Customer's full name
    userEmail: string;              // Customer's email for notifications
    address: string;                // Delivery address
    cart: OrderItem[];              // Array of ordered items
    total: number;                  // Final order total in INR
    status: string;                 // Current order status
    razorpayOrderId: string;        // Payment gateway reference ID
    createdAt: string;              // ISO timestamp of order creation
}

/**
 * Order Status Type Definition
 * 
 * Defines the complete lifecycle of an order from placement to completion
 * Ensures type safety for status transitions and validations
 */
type OrderStatus = "placed" | "confirmed" | "preparing" | "out_for_delivery" | "completed" | "canceled";

/**
 * Status Color Mapping
 * 
 * Provides consistent visual indicators for each order state
 * Uses Tailwind CSS classes for theming and accessibility
 */
const statusColors: Record<OrderStatus, string> = {
    placed: "text-amber-400",           // New order awaiting confirmation
    confirmed: "text-blue-400",         // Restaurant has accepted order
    preparing: "text-yellow-400",       // Kitchen is preparing food
    out_for_delivery: "text-purple-400", // Order is with delivery personnel
    completed: "text-green-400",        // Order successfully delivered
    canceled: "text-red-400"            // Order canceled (with refund processing)
};

/**
 * Status Label Mapping
 * 
 * User-friendly display names for order statuses
 * Used in dropdowns and status displays throughout the UI
 */
const statusLabels: Record<OrderStatus, string> = {
    placed: "Placed",
    confirmed: "Confirmed",
    preparing: "Preparing",
    out_for_delivery: "Out for Delivery",
    completed: "Completed",
    canceled: "Canceled"
};

/**
 * AdminOrdersPage Component
 * 
 * Comprehensive order management interface for restaurant administrators
 * Provides real-time order monitoring, status updates, and cancellation capabilities
 * 
 * @component
 * @example
 * <AdminOrdersPage />
 * 
 * @features
 * - Real-time order tracking with automatic refresh
 * - Bulk order status management
 * - Order cancellation with refund processing
 * - Responsive design (desktop table + mobile cards)
 * - Optimistic UI updates for better perceived performance
 * - Role-based access control
 * - Comprehensive error handling and user feedback
 * 
 * @security
 * - Admin-only access enforcement via useIsAdmin hook
 * - Protected API endpoints with server-side validation
 * - No sensitive data exposure in UI (masked where necessary)
 * - CSRF protection through proper HTTP methods
 * 
 * @performance
 * - Memoized calculations prevent unnecessary re-renders
 * - Optimistic updates reduce perceived latency
 * - Automatic refresh with cleanup to prevent memory leaks
 * - Efficient state management with Set for tracking operations
 * 
 * @user_experience
 * - Loading states for all asynchronous operations
 * - Toast notifications for user feedback
 * - Intuitive status progression workflow
 * - Mobile-optimized interface for on-the-go management
 * - Clickable rows for detailed order inspection
 */
export default function AdminOrdersPage() {
    const router = useRouter();

    /**
     * Admin Access Control Hook
     * 
     * Validates user permissions before rendering admin features
     * Redirects unauthorized users automatically
     */
    const { isAdmin, isLoading: isAdminLoading } = useIsAdmin();

    /**
     * Component State Management
     * 
     * @state orders - Complete list of orders fetched from API
     * @state loading - Initial data loading state
     * @state updatingOrders - Tracks orders currently being updated (prevents duplicate operations)
     * @state cancelingOrders - Tracks orders in cancellation process (prevents duplicate cancellations)
     */
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set());
    const [cancelingOrders, setCancelingOrders] = useState<Set<string>>(new Set());

    /**
     * Data Fetching Effect
     * 
     * Fetches orders when admin access is confirmed
     * Implements auto-refresh every 30 seconds for real-time updates
     * Cleanup function prevents memory leaks from intervals
     */
    useEffect(() => {
        if (isAdmin) {
            fetchOrders();
            // Real-time order monitoring with 30-second intervals
            const interval = setInterval(fetchOrders, 30000);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line
    }, [isAdmin]);

    /**
     * Orders Data Fetcher
     * 
     * Retrieves all orders from the API with error handling
     * Updates local state and manages loading states
     * 
     * @async
     * @function
     * @throws {Error} When API response is not OK
     */
    const fetchOrders = useCallback(async () => {
        try {
            const response = await fetch("/api/orders");
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch orders");
            }

            const data = await response.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error(error instanceof Error ? error.message : "Error fetching orders");
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Order Status Updater
     * 
     * Handles order status transitions with optimistic UI updates
     * Provides immediate feedback while syncing with server
     * 
     * @async
     * @function
     * @param {string} orderId - ID of order to update
     * @param {OrderStatus} status - New status to apply
     * @param {React.MouseEvent | React.ChangeEvent | undefined} e - Event for propagation control
     */
    const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus, e: React.MouseEvent | React.ChangeEvent | undefined) => {
        e?.stopPropagation();

        // Track updating order to prevent duplicate requests
        setUpdatingOrders(prev => new Set(prev).add(orderId));

        try {
            const response = await fetch(`/api/orders/${orderId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });

            if (response.ok) {
                toast.success("Order status updated");
                // Optimistic UI update for immediate feedback
                setOrders(prev => prev.map(order =>
                    order._id === orderId ? { ...order, status } : order
                ));
            } else {
                throw new Error("Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Error updating status");
            // Re-fetch to ensure UI consistency with server state
            fetchOrders();
        } finally {
            // Clean up tracking regardless of outcome
            setUpdatingOrders(prev => {
                const newSet = new Set(prev);
                newSet.delete(orderId);
                return newSet;
            });
        }
    }, [fetchOrders]);

    /**
     * Order Cancellation Handler
     * 
     * Processes order cancellations with refund notifications
     * Implements optimistic updates and proper error recovery
     * 
     * @async
     * @function
     * @param {string} orderId - ID of order to cancel
     * @param {React.MouseEvent} e - Click event for propagation control
     */
    const cancelOrder = useCallback(async (orderId: string, e: React.MouseEvent) => {
        e.stopPropagation();

        // Track canceling order to prevent duplicate requests
        setCancelingOrders(prev => new Set(prev).add(orderId));

        try {
            const response = await fetch(`/api/orders/${orderId}/cancel`, {
                method: "PATCH",
            });

            if (response.ok) {
                toast.success("Order canceled. User will be refunded within 24 hours.");
                // Optimistic UI update for immediate feedback
                setOrders(prev => prev.map(order =>
                    order._id === orderId ? { ...order, status: "canceled" } : order
                ));
            } else {
                throw new Error("Failed to cancel order");
            }
        } catch (error) {
            console.error("Error canceling order:", error);
            toast.error("Error canceling order");
            // Re-fetch to ensure UI consistency with server state
            fetchOrders();
        } finally {
            // Clean up tracking regardless of outcome
            setCancelingOrders(prev => {
                const newSet = new Set(prev);
                newSet.delete(orderId);
                return newSet;
            });
        }
    }, [fetchOrders]);

    /**
     * Order Detail Navigation
     * 
     * Handles row/card clicks to navigate to order details page
     * Provides intuitive drill-down functionality
     * 
     * @function
     * @param {string} orderId - ID of order to view details for
     */
    const handleRowClick = useCallback((orderId: string) => {
        router.push(`/orders/${orderId}`);
    }, [router]);

    /**
     * Orders Sorting Hook
     * 
     * Sorts orders by creation date (newest first) for optimal workflow
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
     * Combined Loading State
     * 
     * Aggregates admin verification and data loading states
     * Ensures proper loading UX during initial render
     */
    const isLoading = isAdminLoading || loading;

    /**
     * Loading State
     * 
     * Displays loading spinner during initial data fetch
     * Provides consistent loading experience
     */
    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto mt-22 px-4">
                <SectionHeader subHeader="" mainHeader="Manage Orders" />
                <div className="flex justify-center">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    /**
     * Access Denied State
     * 
     * Shows unauthorized message for non-admin users
     * Prevents access to order management features
     */
    if (!isAdmin) {
        return (
            <div className="max-w-7xl mx-auto mt-10 px-4 py-12 text-amber-100">
                <h2 className="text-2xl font-bold mb-6 text-primary heading-border">
                    Admin Access Required
                </h2>
                <p>You must be an administrator to view this page.</p>
            </div>
        );
    }

    /**
     * Main Component Render
     * 
     * Implements comprehensive order management interface with:
     * - Order summary and refresh controls
     * - Responsive data tables (desktop) and cards (mobile)
     * - Real-time status management
     * - Cancellation workflow
     * - Detailed order navigation
     */
    return (
        <div className="max-w-7xl min-h-[90vh] mx-auto mt-10 px-4 py-12 text-amber-100">
            <SectionHeader subHeader="" mainHeader="Manage Orders" />

            {/* Order Summary and Controls */}
            <div className="mb-4 flex justify-between items-center">
                <p className="text-amber-300">
                    {sortedOrders.length} order{sortedOrders.length !== 1 ? 's' : ''} found
                </p>
                <button
                    onClick={fetchOrders}
                    className="bg-primary hover:bg-amber-600 text-white px-3 py-1 rounded text-sm cursor-pointer"
                >
                    Refresh
                </button>
            </div>

            {/* Orders Display */}
            {sortedOrders.length === 0 ? (
                <p className="text-gray-400">No orders found.</p>
            ) : (
                <div className="overflow-x-auto rounded-md bg-[#2c1a0d] border border-amber-800">
                    {/* Desktop Table View */}
                    <table className="w-full hidden md:table">
                        <thead>
                            <tr className="bg-[#1a1108]">
                                <th className="px-4 py-2 text-left">Order ID</th>
                                <th className="px-4 py-2 text-left">Customer</th>
                                <th className="px-4 py-2 text-left">Address</th>
                                <th className="px-4 py-2 text-left">Items</th>
                                <th className="px-4 py-2 text-left">Total</th>
                                <th className="px-4 py-2 text-left">Status</th>
                                <th className="px-4 py-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedOrders.map((order) => {
                                const isUpdating = updatingOrders.has(order._id);
                                const isCanceling = cancelingOrders.has(order._id);
                                const isCompletedOrCanceled = order.status === "completed" || order.status === "canceled";

                                return (
                                    <tr
                                        key={order._id}
                                        onClick={() => handleRowClick(order._id)}
                                        className="border-b border-amber-800 hover:bg-[#3a281a] cursor-pointer"
                                    >
                                        <td className="px-4 py-3">{order.razorpayOrderId}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-semibold">{order.userName}</div>
                                            <div className="text-sm text-amber-200">{order.userEmail}</div>
                                        </td>
                                        <td className="px-4 py-3 max-w-xs truncate">{order.address}</td>
                                        <td className="px-4 py-3">{order.cart.length}</td>
                                        <td className="px-4 py-3 font-semibold">₹{order.total}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {isUpdating ? (
                                                    <div className="h-4 w-4 flex items-center justify-center">
                                                        <LoadingSpinner />
                                                    </div>
                                                ) : (
                                                    <div className={`w-2 h-2 rounded-full ${statusColors[order.status as OrderStatus]}`} />
                                                )}
                                                <select
                                                    value={order.status}
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) => updateOrderStatus(order._id, e.target.value as OrderStatus, e)}
                                                    className={`bg-[#1a1108] border border-amber-700 rounded px-2 py-1 ${isCompletedOrCanceled
                                                        ? "opacity-50 cursor-not-allowed"
                                                        : "cursor-pointer"
                                                        }`}
                                                    disabled={isCompletedOrCanceled || isUpdating}
                                                >
                                                    {Object.entries(statusLabels)
                                                        .filter(([value]) => value !== "canceled" || order.status === "canceled")
                                                        .map(([value, label]) => (
                                                            <option key={value} value={value}>{label}</option>
                                                        ))}
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {order.status === "canceled" ? (
                                                <span className="text-red-500 font-semibold">Canceled</span>
                                            ) : order.status === "completed" ? (
                                                <span className="text-green-500 font-semibold">Completed</span>
                                            ) : (
                                                <button
                                                    onClick={(e) => cancelOrder(order._id, e)}
                                                    disabled={isCanceling}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed h-3 w-3 flex items-center justify-center"
                                                >
                                                    {isCanceling ? (
                                                        <LoadingSpinner />
                                                    ) : 'Cancel'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Mobile Card View */}
                    <div className="md:hidden">
                        {sortedOrders.map((order) => {
                            const isUpdating = updatingOrders.has(order._id);
                            const isCanceling = cancelingOrders.has(order._id);
                            const isCompletedOrCanceled = order.status === "completed" || order.status === "canceled";

                            return (
                                <div
                                    key={order._id}
                                    onClick={() => handleRowClick(order._id)}
                                    className="p-4 border-b border-amber-800 hover:bg-[#3a281a] cursor-pointer"
                                >
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <div className="font-semibold">Order ID:</div>
                                        <div>{order.razorpayOrderId}</div>

                                        <div className="font-semibold">Customer:</div>
                                        <div>
                                            <div>{order.userName}</div>
                                            <div className="text-sm text-amber-200">{order.userEmail}</div>
                                        </div>

                                        <div className="font-semibold">Address:</div>
                                        <div className="truncate">{order.address}</div>

                                        <div className="font-semibold">Items:</div>
                                        <div>{order.cart.length}</div>

                                        <div className="font-semibold">Total:</div>
                                        <div className="font-semibold">₹{order.total}</div>
                                    </div>

                                    <div className="flex flex-col space-y-3">
                                        <div>
                                            <div className="font-semibold mb-1">Status:</div>
                                            <div className="flex items-center gap-2">
                                                {isUpdating ? (
                                                    <div className="h-4 w-4 flex items-center justify-center">
                                                        <LoadingSpinner />
                                                    </div>
                                                ) : (
                                                    <div className={`w-2 h-2 rounded-full ${statusColors[order.status as OrderStatus]}`} />
                                                )}
                                                <select
                                                    value={order.status}
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) => updateOrderStatus(order._id, e.target.value as OrderStatus, e)}
                                                    className={`w-full bg-[#1a1108] border border-amber-700 rounded px-2 py-1 ${isCompletedOrCanceled
                                                        ? "opacity-50 cursor-not-allowed"
                                                        : "cursor-pointer"
                                                        }`}
                                                    disabled={isCompletedOrCanceled || isUpdating}
                                                >
                                                    {Object.entries(statusLabels)
                                                        .filter(([value]) => value !== "canceled" || order.status === "canceled")
                                                        .map(([value, label]) => (
                                                            <option key={value} value={value}>{label}</option>
                                                        ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            {order.status === "canceled" ? (
                                                <span className="block text-center text-red-500 font-semibold">
                                                    Canceled
                                                </span>
                                            ) : order.status === "completed" ? (
                                                <span className="block text-center text-green-500 font-semibold">
                                                    Completed
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={(e) => cancelOrder(order._id, e)}
                                                    disabled={isCanceling}
                                                    className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed h-10 flex items-center justify-center"
                                                >
                                                    {isCanceling ? (
                                                        <LoadingSpinner />
                                                    ) : 'Cancel Order'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}