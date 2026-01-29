import React from "react";
import SectionHeader from "@/components/layout/SectionHeader";
import BackButton from "@/components/layout/BackButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import dbConnect from "@/lib/mongoose";
import OrderModel from "@/app/models/Orders";
import Image from "next/image";

import { Order, OrderItem, DBOrder } from "@/types/order";


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
            // Ensure database connection
            await dbConnect();

            // Find order by ID in the database
            const orderDoc = await OrderModel.findById(id).lean() as DBOrder | null;

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
        <div className="max-w-7xl mx-auto mt-8 px-4 py-12 text-amber-100">
            {/* Back Button */}
            <div className="mb-6">
                <BackButton />
            </div>

            {/* Page Header */}
            <div className="text-center mb-6 md:mb-10">
                <h3 className="uppercase font-bold tracking-widest text-card text-xs md:text-sm mb-2">Order Tracking</h3>
                <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-white break-all max-w-4xl mx-auto px-2">
                    Order: <span className="text-amber-500">#{order.razorpayOrderId}</span>
                </h1>
                <div className='w-16 md:w-24 h-1 bg-primary mx-auto rounded-full mt-3 md:mt-4'></div>
            </div>

            {/* Main Order Content Container */}
            <div className="bg-[#1a1108] border border-amber-900/50 rounded-xl shadow-2xl overflow-hidden">
                {/* Order Header Banner */}
                <div className="bg-[#2c1a0d]/50 p-4 sm:p-6 md:p-8 border-b border-amber-900/30">
                    <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start md:items-center gap-4 sm:gap-6">
                        <div className="space-y-1 text-center sm:text-left">
                            <div className="flex items-center justify-center sm:justify-start gap-3">
                                <span className={`text-base md:text-lg font-bold uppercase tracking-widest ${getStatusColor(order.status)}`}>
                                    {getStatusLabel(order.status)}
                                </span>
                            </div>
                            <p className="text-amber-300/80 text-xs md:text-sm max-w-62.5 sm:max-w-none">
                                Placed on {formatDate(order.createdAt)}
                            </p>
                        </div>
                        <div className="text-center sm:text-right">
                            <p className="text-[10px] md:text-xs uppercase text-amber-500 font-bold tracking-widest mb-1">Total Amount</p>
                            <div className="text-2xl md:text-3xl font-black text-amber-50">{formatCurrency(order.total)}</div>
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-6 md:p-8 space-y-8 md:space-y-10">
                    {/* Order Items Section */}
                    <div>
                        <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center justify-center sm:justify-start gap-2">
                            <span className="text-primary">🍕</span> Order Items
                        </h2>
                        <div className="grid gap-3 md:gap-4">
                            {groupedItemsArray.map((group, idx) => (
                                <div
                                    key={`${group.item.name}-${idx}`}
                                    className="bg-[#2c1a0d]/30 border border-amber-900/20 p-3 md:p-4 rounded-xl flex flex-col sm:flex-row items-center sm:items-start gap-4 transition-all hover:border-primary/30"
                                >
                                    {/* Item Image */}
                                    {group.item.imageUrl && (
                                        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-amber-900/30 shadow-md">
                                            <Image
                                                src={group.item.imageUrl}
                                                alt={group.item.name}
                                                className="w-full h-full object-cover"
                                                width={80}
                                                height={80}
                                            />
                                        </div>
                                    )}

                                    {/* Item Details */}
                                    <div className="flex-1 text-center sm:text-left min-w-0 w-full">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-2">
                                            <p className="text-base md:text-lg font-bold text-amber-50 whitespace-normal">
                                                {group.item.name}
                                                {group.quantity > 1 && (
                                                    <span className="bg-primary/20 text-primary text-[10px] md:text-xs px-2 py-0.5 rounded ml-2 align-middle">
                                                        x{group.quantity}
                                                    </span>
                                                )}
                                            </p>
                                            <p className="font-bold text-base md:text-lg text-amber-200">
                                                {formatCurrency(group.total * group.quantity)}
                                            </p>
                                        </div>

                                        <div className="space-y-1">
                                            {group.item.size && (
                                                <p className="text-xs md:text-sm text-amber-400/80 flex items-center gap-1.5 justify-center sm:justify-start">
                                                    <span className="w-1 h-1 bg-amber-600 rounded-full" />
                                                    Size: {group.item.size.name}
                                                </p>
                                            )}
                                            {(group.item.extras?.length ?? 0) > 0 && (
                                                <div className="text-xs md:text-sm text-amber-400/80 flex items-start gap-1.5 justify-center sm:justify-start">
                                                    <span className="w-1 h-1 bg-amber-600 rounded-full mt-1.5 shrink-0" />
                                                    <span className="whitespace-normal">Extras: {group.item.extras!.map(e => e.name).join(', ')}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Information Grid: Delivery Details & Order Summary */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                        {/* Delivery Information Card */}
                        <div className="bg-black/20 p-4 md:p-6 rounded-xl border border-amber-900/20">
                            <h2 className="font-bold text-base md:text-lg mb-4 md:mb-6 flex items-center gap-2 text-amber-500 uppercase tracking-widest justify-center sm:justify-start">
                                Delivery Details
                            </h2>
                            <div className="space-y-3 md:space-y-4">
                                <div className="flex flex-col text-center sm:text-left">
                                    <span className="text-[10px] uppercase text-amber-600 font-bold tracking-tighter">Customer Name</span>
                                    <span className="text-sm md:text-base text-amber-50 font-medium">{order.userName}</span>
                                </div>
                                <div className="flex flex-col text-center sm:text-left">
                                    <span className="text-[10px] uppercase text-amber-600 font-bold tracking-tighter">Email Address</span>
                                    <span className="text-sm md:text-base text-amber-50 font-medium break-all">{order.userEmail}</span>
                                </div>
                                <div className="flex flex-col text-center sm:text-left">
                                    <span className="text-[10px] uppercase text-amber-600 font-bold tracking-tighter">
                                        Shipping Address
                                    </span>
                                    <span className="text-sm md:text-base text-amber-200/90 whitespace-normal">{order.address}</span>
                                </div>
                            </div>
                        </div>

                        {/* Financial & Status Summary Card */}
                        <div className="bg-black/20 p-4 md:p-6 rounded-xl border border-amber-900/20">
                            <h2 className="font-bold text-base md:text-lg mb-4 md:mb-6 flex items-center gap-2 text-amber-500 uppercase tracking-widest justify-center sm:justify-start">
                                Billing Summary
                            </h2>
                            <div className="w-full space-y-3">
                                <div className="flex justify-between items-center text-xs md:text-sm text-amber-300/80">
                                    <span>Subtotal</span>
                                    <span className="font-mono">{formatCurrency(order.subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs md:text-sm text-amber-300/80">
                                    <span>Tax (GST)</span>
                                    <span className="font-mono">{formatCurrency(order.tax)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs md:text-sm text-amber-300/80">
                                    <span>Delivery Fee</span>
                                    <span className="font-mono">{formatCurrency(order.deliveryFee)}</span>
                                </div>
                                {order.couponCode && (
                                    <div className="flex justify-between items-center text-xs md:text-sm text-green-400">
                                        <div className="flex items-center gap-1">
                                            <span>Coupon</span>
                                            <span className="bg-green-900/40 px-1.5 py-0.5 rounded text-[10px] font-bold border border-green-800/50 uppercase tracking-tighter">
                                                {order.couponCode}
                                            </span>
                                        </div>
                                        <span className="font-mono">-{formatCurrency(order.discountAmount || 0)}</span>
                                    </div>
                                )}
                                <div className="border-t border-amber-900/50 pt-3 mt-3 flex justify-between items-center text-amber-50 font-black text-lg md:text-xl">
                                    <span className="text-sm md:text-lg">Total Amount</span>
                                    <span>{formatCurrency(order.total)}</span>
                                </div>

                                <div className="pt-4 md:pt-6 space-y-4">
                                    <div className="flex justify-between items-center bg-[#1a1108] p-3 rounded-lg border border-amber-900/30">
                                        <span className="text-[10px] md:text-xs uppercase font-bold text-amber-600">Payment Status</span>
                                        <span className={`text-[10px] md:text-sm font-bold uppercase tracking-wider ${order.paymentStatus === "refund_initiated"
                                            ? "text-primary"
                                            : order.paymentStatus === "paid" || order.paymentStatus === "verified"
                                                ? "text-green-500"
                                                : "text-amber-400"
                                            }`}>
                                            {order.paymentStatus.replace(/_/g, " ")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}