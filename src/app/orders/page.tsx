"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useIsAdmin } from "@/hooks/useAdmin";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import BackButton from "@/components/layout/BackButton";
import LoadingSpinner from "@/components/icons/LoadingSpinner";
import AdminOrderCard from "@/components/orders/AdminOrderCard";

/**
 * AdminOrdersPage Component
 * 
 * Comprehensive order management interface for restaurant administrators
 * Provides real-time order monitoring, status updates, and cancellation capabilities
 */
export default function AdminOrdersPage() {
    const { isAdmin, isLoading: isAdminLoading } = useIsAdmin();
    const { status } = useSession();
    const router = useRouter();

    const {
        orders: sortedOrders,
        loading,
        updatingOrders,
        cancelingOrders,
        fetchOrders,
        updateOrderStatus,
        cancelOrder
    } = useAdminOrders(isAdmin);

    /**
     * Admin Access Enforcement Effect
     */
    useEffect(() => {
        if (!isAdminLoading && !isAdmin) {
            if (status === "unauthenticated") {
                router.replace("/login");
            } else {
                router.replace("/");
            }
        }
    }, [isAdminLoading, isAdmin, status, router]);

    const isLoading = isAdminLoading || (isAdmin && loading);

    const initialScrollDone = React.useRef(false);
    React.useLayoutEffect(() => {
        if (!isLoading && !initialScrollDone.current) {
            window.scrollTo(0, 0);
            initialScrollDone.current = true;
        }
    }, [isLoading]);

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto mt-10 px-4 py-12 text-amber-100 min-h-[80vh]">
                <div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <h1 className="text-3xl font-bold heading-border underline">Manage Orders</h1>
                </div>
                <div className="flex flex-col items-center justify-center mt-32">
                    <LoadingSpinner size="lg" color="text-primary" />
                    <p className="mt-4 text-amber-200">Loading orders...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="max-w-7xl min-h-[90vh] mx-auto mt-8 px-4 py-12 text-amber-100">
            <div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold heading-border underline">Manage Orders</h1>
                <BackButton label="Back" />
            </div>

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
            <div className="rounded-md bg-[#2c1a0d] border border-amber-800">
                <div className="divide-y divide-amber-900/30">
                    {sortedOrders.length === 0 ? (
                        <p className="text-gray-400 p-6">No orders found.</p>
                    ) : (
                        sortedOrders.map((order) => (
                            <AdminOrderCard
                                key={order._id}
                                order={order}
                                isUpdating={updatingOrders.has(order._id)}
                                isCanceling={cancelingOrders.has(order._id)}
                                onStatusChange={updateOrderStatus}
                                onCancel={cancelOrder}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}