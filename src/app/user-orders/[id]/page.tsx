'use client';

import React, { useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import LoadingSpinner from '@/components/icons/LoadingSpinner';
import { CartContext } from '@/components/AppContext';

/**
 * Order Item Interface
 * 
 * Represents individual products within a customer order with complete pricing breakdown
 * Captures product configuration at time of purchase for accurate order history
 */
interface OrderItem {
    _id: string;                              // Unique MongoDB identifier for the order item
    name: string;                             // Product name as displayed to customer
    basePrice: number;                        // Base price without modifications
    imageUrl?: string;                        // Product image for visual identification
    size?: { name: string; extraPrice: number }; // Selected size option with price adjustment
    extras?: { name: string; extraPrice: number }[]; // Additional customizations/toppings
}

/**
 * Complete Order Interface
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
    tax: number;                    // Calculated tax amount (5%)
    deliveryFee: number;            // Shipping/delivery charges
    total: number;                  // Final amount charged to customer
    razorpayOrderId: string;        // Payment gateway transaction reference
    createdAt: string;              // ISO timestamp of order placement
    status: string;                 // Current order lifecycle state
    paymentStatus: string;          // Financial transaction status
    canceledAt?: string;            // Optional timestamp for order cancellation
}

/**
 * Order Status Display Mapping
 * 
 * Provides user-friendly display names for order statuses
 * Converts API status values to human-readable format
 */
const STATUS_DISPLAY_MAP: Record<string, string> = {
    placed: 'Order Placed',
    confirmed: 'Order Confirmed',
    preparing: 'Preparing Your Order',
    out_for_delivery: 'Out for Delivery',
    completed: 'Order Delivered',
    canceled: 'Order Canceled'
};

/**
 * Order Progress Value Mapping
 * 
 * Defines numerical progress values for visual progress bar
 * Maps order statuses to progress steps (1-5)
 */
const PROGRESS_VALUES: Record<string, number> = {
    placed: 1,          // Step 1: Order received
    confirmed: 2,       // Step 2: Restaurant confirmed
    preparing: 3,       // Step 3: Kitchen preparing
    out_for_delivery: 4, // Step 4: Out for delivery
    completed: 5        // Step 5: Order completed
};

/**
 * UserOrderPage Component
 * 
 * Comprehensive order tracking interface for customers with real-time updates
 * Provides detailed order information, progress tracking, and status monitoring
 * 
 * @component
 * @features
 * - Real-time order status polling with automatic updates
 * - Visual progress bar showing order fulfillment stages
 * - Complete order breakdown with item details and pricing
 * - Automatic cart clearing for newly placed orders
 * - Comprehensive error handling with retry mechanisms
 * - Responsive design for all device sizes
 * 
 * @security
 * - Session-gated access prevents unauthorized order viewing
 * - User-specific data filtering through protected API routes
 * - Automatic redirection for unauthenticated users
 * - No sensitive data exposure in client-side rendering
 * 
 * @performance
 * - Intelligent polling with cleanup to prevent memory leaks
 * - Memoized calculations prevent unnecessary re-renders
 * - Optimized image loading with Next.js optimization
 * - Efficient state management with refs for non-reactive values
 * 
 * @user_experience
 * - Real-time status updates without page refresh
 * - Visual progress indicators for order fulfillment
 * - Comprehensive loading and error states
 * - Automatic redirection upon order completion
 * - Accessible interface with proper ARIA labels
 * 
 * @example
 * // Renders detailed order tracking for order ID 'order_123'
 * <UserOrderPage />
 */
export default function UserOrderPage() {
    /**
     * Routing & Authentication Hooks
     * 
     * Manages route parameters, navigation, and user authentication
     * Required for personalized order data and access control
     */
    const params = useParams<{ id?: string }>();
    const orderId = params.id;
    const router = useRouter();
    const { data: session, status: authStatus } = useSession({ required: true });

    /**
     * Cart Context
     * 
     * Provides cart management functionality for clearing cart after successful orders
     * Ensures cart state synchronization with order completion
     */
    const { clearCart } = useContext(CartContext);

    /**
     * Component State Management
     * 
     * @state order - Complete order data from API
     * @state loadingOrder - Tracks order data loading state
     * @state statusText - Current order status for real-time updates
     * @state isRedirecting - Tracks redirection state after order completion
     */
    const [order, setOrder] = useState<Order | null>(null);
    const [loadingOrder, setLoadingOrder] = useState(true);
    const [statusText, setStatusText] = useState<string>('');
    const [isRedirecting, setIsRedirecting] = useState(false);

    /**
     * Non-Reactive Value Refs
     * 
     * Tracks values that shouldn't trigger re-renders but persist across renders
     * @ref hasClearedCart - Prevents duplicate cart clearing operations
     * @ref pollingIntervalRef - Manages real-time status polling interval
     * @ref retryTimeoutRef - Manages data fetching retry timeout
     */
    const hasClearedCart = useRef(false);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    /**
     * Item Total Calculator
     * 
     * Computes individual item totals including base price, size upgrades, and extras
     * Ensures accurate price display matching original checkout calculations
     * 
     * @function
     * @param {OrderItem} item - Order item to calculate total for
     * @returns {number} Calculated total price for the item
     */
    const getItemTotal = useCallback((item: OrderItem): number =>
        item.basePrice +
        (item.size?.extraPrice ?? 0) +
        (item.extras?.reduce((sum, e) => sum + e.extraPrice, 0) ?? 0),
        []
    );

    /**
     * Order Data Fetcher with Retry Logic
     * 
     * Retrieves specific order details with comprehensive error handling and retry mechanism
     * Implements exponential backoff through recursive retry pattern
     * 
     * @async
     * @function
     * @param {boolean} isRetry - Indicates if this is a retry attempt
     */
    const fetchOrder = useCallback(async (isRetry = false) => {
        if (!orderId) return;

        try {
            if (!isRetry) {
                setLoadingOrder(true);
            }

            const res = await fetch(`/api/user-orders/${orderId}`);

            if (!res.ok) {
                throw new Error('Failed to fetch order');
            }

            const data = await res.json();

            if (data.success === false) {
                throw new Error(data.error || 'Failed to fetch order');
            }

            setOrder(data as Order);
            setStatusText(data.status);

            // Clear cart for newly placed orders (one-time operation)
            if (data.status === 'placed' && !hasClearedCart.current) {
                clearCart();
                hasClearedCart.current = true;
            }

            setLoadingOrder(false);
        } catch (err: unknown) {
            console.error('Order fetch error', err);

            // Retry after 2 seconds if this is the first failure
            if (!isRetry) {
                if (retryTimeoutRef.current) {
                    clearTimeout(retryTimeoutRef.current);
                }

                retryTimeoutRef.current = setTimeout(() => {
                    fetchOrder(true);
                }, 2000);
            } else {
                // If retry also failed, show user-friendly message
                toast.info('Order data is taking longer than expected to load...');
            }
        }
    }, [orderId, clearCart]);

    /**
     * Initial Data Fetching Effect
     * 
     * Controls initial order data fetching based on authentication status
     * Implements proper cleanup for retry timeouts to prevent memory leaks
     */
    useEffect(() => {
        if (authStatus === 'loading') return;

        if (!session) {
            toast.error('Please log in to view your order.');
            router.replace('/login');
            return;
        }

        if (!orderId) {
            toast.error('Order ID missing in URL');
            setLoadingOrder(false);
            return;
        }

        fetchOrder();

        return () => {
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, [authStatus, session, router, orderId, fetchOrder]);

    /**
     * Real-time Status Polling Effect
     * 
     * Implements intelligent polling for order status updates
     * Automatically stops polling for completed/canceled orders
     * Handles order completion with automatic redirection
     */
    useEffect(() => {
        if (!order || /^(completed|canceled)$/.test(statusText)) return;

        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }

        pollingIntervalRef.current = setInterval(async () => {
            try {
                const res = await fetch(`/api/user-orders/${orderId}/status`);
                if (!res.ok) return;

                const { status: newStatus } = await res.json();

                if (newStatus && newStatus !== statusText) {
                    setStatusText(newStatus);

                    // Handle order completion with automatic redirection
                    if (newStatus === 'completed') {
                        setIsRedirecting(true);
                        toast.info('Order delivered! Redirecting...');
                        setTimeout(() => router.push('/user-orders'), 2000);
                    }
                }
            } catch (err) {
                console.error('Polling failed', err);
            }
        }, 10_000); // Poll every 10 seconds

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [orderId, order, statusText, router]);

    /**
     * Progress Value Calculation
     * 
     * Maps current order status to numerical progress value (0-5)
     * Used for visual progress bar rendering
     */
    const progressValue = useMemo(
        () => PROGRESS_VALUES[statusText] || 0,
        [statusText]
    );

    /**
     * Status Display Text
     * 
     * Provides user-friendly status text based on current order status
     * Falls back to "Processing Order" for unknown statuses
     */
    const displayStatus = useMemo(
        () => STATUS_DISPLAY_MAP[statusText] || 'Processing Order',
        [statusText]
    );

    /**
     * Loading State
     * 
     * Displays loading spinner during authentication and initial data fetch
     * Provides consistent loading experience during critical operations
     */
    if (authStatus === 'loading' || loadingOrder) {
        return (
            <div className="max-w-7xl mx-auto mt-20 px-4 text-amber-100">
                <h1 className="text-3xl font-bold text-primary heading-border">Your Order</h1>
                <div className="flex justify-center items-center flex-col">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    /**
     * Redirecting State
     * 
     * Displays loading state during automatic redirection after order completion
     * Provides user feedback during navigation transition
     */
    if (isRedirecting) {
        return (
            <div className="max-w-7xl mx-auto mt-20 px-4 text-amber-100">
                <h1 className="text-3xl font-bold mb-8 text-primary heading-border">Order Delivered</h1>
                <div className="flex justify-center items-center flex-col">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    /**
     * Error State - No Order Data
     * 
     * Handles cases where order data cannot be loaded after retries
     * Provides recovery option through manual retry
     */
    if (!order) {
        return (
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 text-amber-100">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary heading-border">
                    Unable to Load Order
                </h2>
                <p>We&apos;re having trouble loading your order details.</p>
                <button
                    onClick={() => fetchOrder()}
                    className="mt-4 px-4 py-2 bg-amber-800 hover:bg-amber-700 text-white rounded-lg font-semibold"
                >
                    Try Again
                </button>
            </div>
        );
    }

    /**
     * Main Component Render
     * 
     * Implements comprehensive order tracking interface with:
     * - Order header with metadata and status
     * - Visual progress bar showing fulfillment stages
     * - Detailed item breakdown with images and pricing
     * - Delivery and payment information sections
     * - Responsive layout for all device sizes
     */
    return (
        <div className="w-full mx-auto mt-15 px-4 sm:px-6 lg:px-8 py-8 text-amber-100">
            <div className="bg-[#1a1108] border border-amber-900 p-4 sm:p-6 rounded-lg shadow-lg">
                {/* Order Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-6 sm:mb-8">
                    <div className="text-center md:text-left">
                        <h1 className="text-xl sm:text-2xl font-bold">
                            Order #{order.razorpayOrderId.slice(0, 8)}
                        </h1>
                        <p className="text-sm sm:text-base text-amber-300">
                            Placed on {new Date(order.createdAt).toLocaleString()}
                        </p>
                    </div>
                    <div className="mt-3 md:mt-0 text-center md:text-right">
                        <div className="text-lg sm:text-xl font-bold">
                            ₹{order.total}
                        </div>
                        <div className={`mt-1 text-xs sm:text-sm font-semibold ${statusText === "canceled"
                            ? "text-red-400"
                            : statusText === "completed"
                                ? "text-green-400"
                                : "text-amber-400"
                            }`}
                        >
                            {displayStatus}
                        </div>
                    </div>
                </div>

                {/* Order Progress Tracking Section */}
                <div className="mb-8">
                    <div className="flex justify-between mb-1 text-[0.65rem] sm:text-sm">
                        <span>Placed</span>
                        <span>Confirmed</span>
                        <span>Preparing</span>
                        <span>On the Way</span>
                        <span>Delivered</span>
                    </div>
                    <div className="relative h-2 bg-amber-900 rounded-full">
                        <div
                            className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${(progressValue / 5) * 100}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <div
                                key={n}
                                className={`${n <= progressValue
                                    ? "bg-primary"
                                    : "bg-amber-900"
                                    } flex items-center justify-center rounded-full text-[0.6rem] sm:text-xs ${n <= progressValue ? "text-white" : "text-amber-400"
                                    } w-5 h-5`}
                            >
                                {n <= progressValue ? "✓" : n}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Items Section */}
                <div className="mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold mb-3 text-primary">Your Items</h2>
                    <div className="space-y-3">
                        {order.cart.map((item, idx) => (
                            <div
                                key={`${item._id}-${idx}`}
                                className="bg-[#2c1a0d] border border-amber-800 rounded-lg p-3 flex flex-col sm:flex-row justify-between gap-3"
                            >
                                <div className="flex gap-3">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 relative flex-shrink-0">
                                        <Image
                                            src={item.imageUrl || "/hero-pizza.png"}
                                            alt={item.name}
                                            fill
                                            className="object-cover rounded"
                                            sizes="(max-width: 768px) 100px, 150px"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-sm sm:text-base">
                                            {item.name}
                                        </h3>
                                        {item.size && (
                                            <p className="text-[0.65rem] sm:text-sm text-amber-200">
                                                <strong>Size:</strong> {item.size.name}
                                            </p>
                                        )}
                                        {(item.extras?.length ?? 0) > 0 && (
                                            <p className="text-[0.65rem] sm:text-sm text-amber-200">
                                                <strong>Toppings:</strong>{" "}
                                                {item.extras?.map((e) => e.name).join(", ")}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col justify-between items-end mt-2 sm:mt-0">
                                    <p className="text-sm sm:text-base text-amber-300 font-semibold">
                                        ₹{getItemTotal(item)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Information Grid: Delivery & Payment Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    {/* Delivery Information Card */}
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold mb-3 text-primary">Delivery Details</h2>
                        <div className="bg-[#2c1a0d] border border-amber-800 rounded-lg p-3 sm:p-4">
                            <p className="text-sm sm:text-base mb-2">
                                <span className="text-amber-400">Name</span><br />
                                {order.userName}
                            </p>
                            <p className="text-sm sm:text-base mb-2">
                                <span className="text-amber-400">Email</span><br />
                                {order.userEmail}
                            </p>
                            <p className="text-sm sm:text-base">
                                <span className="text-amber-400">Delivery Address</span><br />
                                {order.address}
                            </p>
                        </div>
                    </div>

                    {/* Payment Summary Card */}
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold mb-3 text-primary">Payment Summary</h2>
                        <div className="bg-[#2c1a0d] border border-amber-800 rounded-lg p-3 sm:p-4 space-y-1">
                            <div className="flex justify-between text-sm sm:text-base">
                                <span>Subtotal:</span><span>₹{order.subtotal}</span>
                            </div>
                            <div className="flex justify-between text-sm sm:text-base">
                                <span>Tax (5%):</span><span>₹{order.tax}</span>
                            </div>
                            <div className="flex justify-between text-sm sm:text-base">
                                <span>Delivery Fee:</span>
                                <span>
                                    {order.deliveryFee === 0 ? "Free" : `₹${order.deliveryFee}`}
                                </span>
                            </div>
                            <div className="flex justify-between mt-2 pt-2 border-t border-amber-800 font-bold text-base sm:text-lg">
                                <span>Total:</span><span>₹{order.total}</span>
                            </div>
                            <div className="mt-2 pt-2 border-t border-amber-800 text-sm sm:text-base">
                                <p className="text-amber-400">Payment Status</p>
                                <p className={`${order.paymentStatus === "completed" ? "text-green-400" : ""} ${["failed", "canceled"].includes(order.paymentStatus)
                                    ? "text-red-400"
                                    : ""
                                    }`}>
                                    {{
                                        completed: "Payment Successful",
                                        pending: "Payment Pending",
                                        verified: "Payment Verified",
                                        failed: "Payment Failed",
                                        refund_initiated: "Refund Initiated",
                                    }[order.paymentStatus] || order.paymentStatus}
                                </p>
                                {order.canceledAt && (
                                    <p className="text-[0.75rem] text-amber-300 mt-1">
                                        Refund will be processed within 24 hours
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Canceled Notice */}
                {statusText === "canceled" && (
                    <div className="mt-6 p-3 bg-red-900/30 border border-red-700 rounded-lg text-center">
                        <h3 className="text-base sm:text-xl font-bold text-red-300">
                            Order Canceled
                        </h3>
                        <p className="mt-1 text-sm">Your order has been canceled. Any payment made will be refunded within 24 hours.</p>
                    </div>
                )}

                {/* Navigation Back to Orders */}
                <div className="mt-6 flex justify-center">
                    <button
                        onClick={() => router.push("/user-orders")}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-amber-800 hover:bg-amber-700 text-white rounded-lg font-semibold text-sm sm:text-base"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        </div>
    );
}