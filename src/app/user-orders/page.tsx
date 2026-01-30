"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/icons/LoadingSpinner";
import BackButton from "@/components/layout/BackButton";
import { useUserOrders } from "@/hooks/useUserOrders";
import UserOrderCard from "@/components/orders/UserOrderCard";

/**
 * This is the "My Orders" page for customers.
 * 
 * It lists all the past orders the user has placed.
 * They can click on any order to track its status or view details.
 */
export default function OrdersPage() {
    const router = useRouter();
    const { orders: sortedOrders, loading, error, handleRetry } = useUserOrders();

    const handleBrowseMenu = useCallback(() => {
        router.push("/menu");
    }, [router]);

    const initialScrollDone = React.useRef(false);
    React.useLayoutEffect(() => {
        if (!loading && !initialScrollDone.current) {
            window.scrollTo(0, 0);
            initialScrollDone.current = true;
        }
    }, [loading]);

    if (loading) {
        return (
            <div className="max-w-7xl min-h-[83vh] mx-auto mt-10 px-4 py-12 text-amber-100">
                <div className="mb-6">
                    <BackButton />
                </div>
                <h1 className="text-3xl font-bold heading-border underline mb-6">Your Orders</h1>
                <div className="flex flex-col items-center justify-center mt-32">
                    <LoadingSpinner size="lg" color="text-primary" />
                    <p className="mt-4 text-amber-200">Loading your orders...</p>
                </div>
            </div>
        );
    }

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

    return (
        <div className="max-w-7xl min-h-[83vh] mx-auto mt-10 px-4 py-12 text-amber-100">
            <div className="mb-6">
                <BackButton />
            </div>

            <h1 className="text-3xl font-bold heading-border underline mb-6">Your Orders</h1>

            {sortedOrders.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-xl mb-4 text-amber-300">You haven&apos;t placed any orders yet</p>
                    <button
                        onClick={handleBrowseMenu}
                        className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors cursor-pointer"
                    >
                        Browse Menu
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {sortedOrders.map((order) => (
                        <UserOrderCard key={order._id} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
}
