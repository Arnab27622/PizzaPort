"use client";

import React, { useContext, useState, useMemo, useCallback, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { CartContext } from "@/components/AppContext";
import TrashIcon from "@/components/icons/TrashIcon";
import LocationIcon from "@/components/icons/LocationIcon";
import BackButton from "@/components/layout/BackButton";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/icons/LoadingSpinner";

/**
 * Razorpay Type Definitions
 * 
 * Defines TypeScript interfaces for Razorpay integration
 * Ensures type safety when interacting with Razorpay SDK
 */
interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: RazorpayResponse) => void;
    prefill: {
        name: string;
        email: string;
    };
    theme: { color: string };
}

interface RazorpayError {
    error: {
        code: string;
        description: string;
        source: string;
        step: string;
        reason: string;
        metadata: unknown;
    };
}

/**
 * Razorpay Global Type Declaration
 * 
 * Extends Window interface to include Razorpay SDK
 * Provides TypeScript support for Razorpay constructor and methods
 */
declare global {
    interface Window {
        Razorpay: new (opts: RazorpayOptions) => {
            open(): void;
            on(event: string, callback: (response: RazorpayError) => void): void;
            close(): void;
        };
    }
}

/**
 * CartPage Component
 * 
 * Main shopping cart and checkout interface for the application
 * Handles:
 * - Cart item display and management
 * - Price calculations with tax and delivery
 * - User location detection
 * - Razorpay payment integration
 * - Order submission and payment verification
 * 
 * @component
 * @example
 * <CartPage />
 * 
 * @features
 * - Real-time price calculation with tax and delivery
 * - Geolocation-based address detection
 * - Secure Razorpay payment processing
 * - Cart item management (add/remove)
 * - Responsive design for mobile and desktop
 * 
 * @security
 * - Payment signature verification
 * - Cart data integrity checks
 * - User authentication required with automatic redirection
 * 
 * @dependencies
 * - React Context (CartContext)
 * - NextAuth for user session
 * - Razorpay SDK for payments
 * - React Toast for notifications
 */
export default function CartPage() {
    /**
     * State and Context Management
     * 
     * @state cartProducts - Array of items in the shopping cart
     * @state removeCartProduct - Function to remove items from cart
     * @state clearCart - Function to empty the entire cart
     * @state address - User's delivery address
     * @state isProcessing - Payment processing status
     * @state isFetchingLocation - Geolocation loading status
     */
    const { cartProducts, removeCartProduct, clearCart } = useContext(CartContext);
    const { data: session, status } = useSession();
    const router = useRouter();
    const [address, setAddress] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);

    /**
     * Authentication Effect
     * 
     * Redirects unauthenticated users to login page
     * Prevents unauthorized access to cart and checkout functionality
     */
    useEffect(() => {
        if (status === "unauthenticated") {
            toast.error("Please log in to access your cart");
            router.push("/login");
        }
    }, [status, router]);

    /**
     * User Information
     * 
     * Extracts user details from NextAuth session
     * Used for pre-filling payment form and order tracking
     */
    const userName = session?.user?.name || "";
    const userEmail = session?.user?.email || "";

    /**
     * Price Calculation Hook
     * 
     * Memoized calculation of order totals to prevent unnecessary recalculations
     * Recalculates only when cartProducts change
     * 
     * @returns {Object} Price breakdown including:
     *   - subtotal: Sum of all item prices
     *   - tax: 5% GST calculated on subtotal
     *   - deliveryFee: Free above ₹400, otherwise ₹50
     *   - total: Final amount including all charges
     * 
     * @business_rules
     * - Tax rate: 5% fixed GST
     * - Free delivery threshold: ₹400
     * - Delivery fee: ₹50 for orders below threshold
     */
    const { subtotal, tax, deliveryFee, total } = useMemo(() => {
        // Calculate base price including size and extra options
        const calculatedSubtotal = cartProducts.reduce((sum, item) => {
            const sizePrice = item.size?.extraPrice ?? 0;
            const extrasPrice = item.extras?.reduce((s, e) => s + e.extraPrice, 0) ?? 0;
            return sum + item.basePrice + sizePrice + extrasPrice;
        }, 0);

        // Apply business rules for tax and delivery
        const calculatedTax = Math.round(calculatedSubtotal * 0.05); // 5% tax
        const calculatedDeliveryFee = calculatedSubtotal >= 400 ? 0 : 50; // Free delivery above ₹400
        const calculatedTotal = calculatedSubtotal + calculatedTax + calculatedDeliveryFee;

        return {
            subtotal: calculatedSubtotal,
            tax: calculatedTax,
            deliveryFee: calculatedDeliveryFee,
            total: calculatedTotal
        };
    }, [cartProducts]);

    /**
     * Individual Item Price Calculator
     * 
     * Memoized function to calculate total price for a single cart item
     * Includes base price, size upgrade, and extra ingredients
     * 
     * @param {Object} item - Cart product object
     * @returns {number} Total price for the item
     */
    const getItemTotal = useCallback((item: typeof cartProducts[0]) => {
        const sizePrice = item.size?.extraPrice ?? 0;
        const extrasPrice = item.extras?.reduce((s, e) => s + e.extraPrice, 0) ?? 0;
        return item.basePrice + sizePrice + extrasPrice;
    }, []);

    /**
     * Group identical cart items by their configuration
     * Creates a map of unique item configurations to their combined quantities and indices
     */
    const groupedCartItems = useMemo(() => {
        const grouped = cartProducts.reduce((acc, item, index) => {
            const extrasString = (item.extras ?? []).map(e => e.name).sort().join('|');
            const key = `${item._id}|${item.name}|${item.size?.name || ''}|${extrasString}`;
            
            const existing = acc.find(g => g.key === key);
            if (existing) {
                existing.quantity += 1;
                existing.indices.push(index);
            } else {
                acc.push({
                    key,
                    item,
                    quantity: 1,
                    indices: [index]
                });
            }
            
            return acc;
        }, [] as Array<{ key: string; item: typeof cartProducts[0]; quantity: number; indices: number[] }>);
        
        return grouped;
    }, [cartProducts]);

    /**
     * Geolocation Address Fetcher
     * 
     * Uses browser geolocation API and OpenStreetMap to get user's address
     * Provides convenience for users to auto-fill their delivery address
     * 
     * @throws {Error} When geolocation is unsupported or permission denied
     * @security Requires user permission for location access
     */
    const fetchUserLocation = useCallback(async () => {
        // Check browser geolocation support
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setIsFetchingLocation(true);
        try {
            // Get current position with timeout and cache settings
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    timeout: 10000,     // 10 second timeout
                    maximumAge: 60000   // Cache for 1 minute
                });
            });

            // Extract coordinates
            const { latitude, longitude } = position.coords;

            // Reverse geocoding using OpenStreetMap Nominatim API
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );

            if (!res.ok) throw new Error("Failed to fetch address");

            const data = await res.json();
            if (data.display_name) {
                setAddress(data.display_name);
                toast.success("Location fetched successfully");
            }
        } catch (error) {
            console.error("Failed to fetch address:", error);
            toast.error("Could not fetch your location. Please enter manually.");
        } finally {
            setIsFetchingLocation(false);
        }
    }, []);

    /**
     * Order Submission Handler
     * 
     * Main payment flow controller:
     * 1. Validates cart and address
     * 2. Creates Razorpay order via API
     * 3. Initializes Razorpay checkout
     * 4. Handles payment verification
     * 5. Clears cart and redirects on success
     * 
     * @security Includes multiple validation layers and payment verification
     * @throws {Error} API failures, payment initialization errors
     */
    const handleSubmitOrder = useCallback(async () => {
        // Pre-flight validation including authentication check
        if (cartProducts.length === 0 || !address.trim() || !session) return;

        setIsProcessing(true);
        try {
            /**
             * Data Preparation
             * 
             * Creates optimized payload by removing unnecessary fields
             * Reduces network transfer and prevents circular references
             */
            const trimmedCart = cartProducts.map((item) => ({
                _id: item._id,
                name: item.name,
                imageUrl: item.imageUrl,
                basePrice: item.basePrice,
                size: item.size
                    ? { name: item.size.name, extraPrice: item.size.extraPrice }
                    : null,
                extras: item.extras
                    ? item.extras.map((e) => ({ name: e.name, extraPrice: e.extraPrice }))
                    : [],
            }));

            /**
             * Order Creation API Call
             * 
             * Creates Razorpay order and stores order details in database
             * Returns Razorpay order ID and security hash for verification
             */
            const resp = await fetch("/api/razorpay", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: userName,
                    email: userEmail,
                    address,
                    cart: trimmedCart,
                }),
            });

            if (!resp.ok) throw new Error("Failed to create order");

            const order = await resp.json();

            // Validate API response
            if (!order?.razorpayOrderId || typeof order.amount !== "number") {
                toast.error("Failed to create Razorpay order");
                return;
            }

            // Check Razorpay SDK availability
            if (typeof window.Razorpay === "undefined") {
                toast.error("Payment system is not available");
                return;
            }

            /**
             * Razorpay Checkout Configuration
             * 
             * Sets up payment modal with order details and callbacks
             * Uses environment variable for Razorpay key ID
             */
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
                amount: order.amount,           // Amount in paise (₹1 = 100 paise)
                currency: "INR",               // Indian Rupees
                name: "PizzaPort",             // Merchant name
                description: "Order Payment",  // Payment description
                order_id: order.razorpayOrderId as string, // Razorpay order reference
                handler: async function (response: RazorpayResponse) {
                    /**
                     * Payment Success Handler
                     * 
                     * Verifies payment authenticity with backend
                     * Prevents fraudulent payment confirmations
                     */
                    const verifyResp = await fetch("/api/verify-payment", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            ...response,
                            orderId: order.razorpayOrderId,
                            securityHash: order.securityHash, // Cart integrity check
                        }),
                    });

                    const verifyResult = await verifyResp.json();

                    if (verifyResult.success) {
                        toast.success("Payment verified and successful!");
                        clearCart(); // Clear cart only after successful verification
                        router.push(`/user-orders/${order.razorpayOrderId}`);
                    } else {
                        toast.error("Payment verification failed!");
                    }
                },
                prefill: {
                    name: userName,
                    email: userEmail,
                },
                theme: { color: "#F59E0B" }, // Brand color theme
            };

            /**
             * Razorpay Checkout Initialization
             * 
             * Creates and opens Razorpay payment modal
             * Sets up failure handler for payment errors
             */
            const rzp = new window.Razorpay(options);

            // Payment failure handler
            rzp.on("payment.failed", function (response) {
                toast.error(`Payment failed: ${response.error.description}`);
            });

            // Open payment modal
            rzp.open();
        } catch (error) {
            console.error("Order submission error:", error);
            toast.error("Failed to process your order. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    }, [cartProducts, address, userName, userEmail, clearCart, router, session]);

    /**
     * Loading State
     * 
     * Shows loading spinner while checking authentication status
     * Prevents flash of unauthorized content
     */
    if (status === "loading") {
        return (
            <div className="max-w-7xl mx-auto mt-10 px-4 py-12 text-amber-100 min-h-[80vh] flex flex-col items-center justify-center">
                <LoadingSpinner size="lg" color="text-primary" />
                <p className="mt-4 text-amber-300">Loading your cart...</p>
            </div>
        );
    }

    /**
     * Unauthenticated State
     * 
     * Shows redirect message while authentication is being processed
     * Prevents rendering content for unauthenticated users
     */
    if (!session) {
        return (
            <div className="max-w-7xl mx-auto mt-10 px-4 py-12 text-amber-100 min-h-[80vh] flex flex-col items-center justify-center">
                <LoadingSpinner size="lg" color="text-primary" />
                <p className="mt-4 text-amber-300">Redirecting to login...</p>
            </div>
        );
    }

    /**
     * Main Component Render
     * 
     * Two-column layout:
     * - Left: Cart items with management controls
     * - Right: Delivery details and payment summary
     */
    return (
        <div className="max-w-7xl mx-auto mt-10 px-4 py-12 text-amber-100 grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Back Button - Responsive positioning */}
            <div className="col-span-1 lg:col-span-2 mb-6">
                <BackButton label="Back to Menu" />
            </div>
            
            {/* Cart Items Section */}
            <div>
                <h1 className="text-2xl font-bold heading-border underline mb-6 text-card">Your Items</h1>
                {cartProducts.length === 0 ? (
                    <p className="text-gray-400">Your cart is empty.</p>
                ) : (
                    <ul className="space-y-6">
                        {groupedCartItems.map((group) => (
                            <li
                                key={group.key}
                                className="bg-[#2c1a0d] border border-amber-800 rounded-lg p-4 flex flex-col sm:flex-row justify-between gap-4"
                            >
                                {/* Item Details */}
                                <div className="flex gap-4">
                                    <div className="w-24 h-24 relative shrink-0">
                                        <Image
                                            src={group.item.imageUrl || "/hero-pizza.png"}
                                            alt={group.item.name}
                                            fill
                                            className="object-cover rounded"
                                            sizes="96px"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-semibold">
                                            {group.item.name}
                                            {group.quantity > 1 && <span className="text-amber-300 ml-2">x{group.quantity}</span>}
                                        </h3>

                                        {/* Size Information */}
                                        {group.item.size?.name && (
                                            <p className="text-sm text-amber-200">
                                                <strong>Size:</strong> {group.item.size.name}
                                            </p>
                                        )}

                                        {/* Extra Ingredients */}
                                        {(group.item.extras?.length ?? 0) > 0 && (
                                            <p className="text-sm text-amber-200">
                                                <strong>Toppings:</strong>{" "}
                                                {group.item.extras?.map((e) => e.name).join(", ")}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Price and Actions */}
                                <div className="flex flex-col justify-between items-end">
                                    <p className="text-sm text-amber-300 font-semibold">
                                        ₹{getItemTotal(group.item) * group.quantity}
                                    </p>
                                    <button
                                        onClick={() => removeCartProduct(group.indices[0])}
                                        className="text-red-400 hover:text-red-600 cursor-pointer transition-colors"
                                        title={group.quantity > 1 ? "Remove one item" : "Remove item"}
                                        aria-label={`Remove ${group.item.name} from cart`}
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Delivery and Payment Section */}
            <div className="bg-[#1a1108] border border-amber-900 p-6 rounded-lg shadow-lg space-y-6">
                <h2 className="text-2xl font-bold">Delivery Details</h2>

                {/* Name Field (Read-only) */}
                <div>
                    <label className="block text-sm mb-1">Name</label>
                    <input
                        type="text"
                        value={userName}
                        readOnly
                        className="w-full px-4 py-2 rounded bg-[#2c1a0d] border border-amber-800 text-white cursor-not-allowed"
                        aria-readonly="true"
                    />
                </div>

                {/* Email Field (Read-only) */}
                <div>
                    <label className="block text-sm mb-1">Email</label>
                    <input
                        type="email"
                        value={userEmail}
                        readOnly
                        className="w-full px-4 py-2 rounded bg-[#2c1a0d] border border-amber-800 text-white cursor-not-allowed"
                        aria-readonly="true"
                    />
                </div>

                {/* Address Input with Geolocation */}
                <div className="space-y-2">
                    <label className="block text-sm mb-1">Delivery Address</label>
                    <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-4 py-2 rounded bg-[#2c1a0d] border border-amber-800 text-white resize-none"
                        rows={3}
                        placeholder="Enter your delivery address"
                        aria-required="true"
                    />
                     <button
                        onClick={fetchUserLocation}
                        disabled={isFetchingLocation}
                        className="text-sm text-amber-400 hover:text-white flex gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Use current location"
                    >
                        {isFetchingLocation ? (
                            <LoadingSpinner size="sm" color="text-amber-400" className="mr-1" />
                        ) : (
                            <LocationIcon />
                        )}
                        {isFetchingLocation ? "Fetching location..." : "Use Current Location"}
                    </button>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 text-sm font-medium">
                    <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Tax (5%):</span>
                        <span>₹{tax}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Delivery Fee:</span>
                        <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold pt-1 border-t border-amber-800">
                        <span>Total:</span>
                        <span>₹{total}</span>
                    </div>
                </div>

                {/* Payment Button */}
                <button
                    onClick={handleSubmitOrder}
                    disabled={cartProducts.length === 0 || !address.trim() || isProcessing}
                    className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-white hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center gap-2 cursor-pointer"
                    aria-label={isProcessing ? "Processing your order" : "Submit order"}
                >
                    {isProcessing ? (
                        <>
                            <LoadingSpinner size="sm" color="text-white" />
                            Processing...
                        </>
                    ) : (
                        "Submit Order"
                    )}
                </button>
            </div>
        </div>
    );
}