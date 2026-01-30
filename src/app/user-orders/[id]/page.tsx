/**
 * This is the Order Tracking Page for customers.
 * 
 * After placing an order, customers land here (or navigate via "My Orders").
 * It shows:
 * 1. A Progress Bar (Placed -> Preparing -> Delivered).
 * 2. What they ordered.
 * 3. Total amount paid.
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/icons/LoadingSpinner';
import OrderProgressBar from '@/components/orders/OrderProgressBar';
import OrderItemList from '@/components/orders/OrderItemList';
import OrderDeliveryDetails from '@/components/orders/OrderDeliveryDetails';
import OrderBillingSummary from '@/components/orders/OrderBillingSummary';
import OrderHeader from '@/components/orders/OrderHeader';
import { useUserOrderDetail } from '@/hooks/useUserOrderDetail';

export default function UserOrderPage() {
    const router = useRouter();
    const { order, loading, statusText, fetchOrder } = useUserOrderDetail();

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto mt-10 px-4 py-12 text-amber-100 min-h-[80vh] flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold mb-8 text-primary heading-border">Order Details</h1>
                <LoadingSpinner size="lg" color="text-primary" className="mb-4" />
                <p className="text-amber-300">Loading order details...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 text-amber-100 mt-15">
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

    return (
        <div className="w-full mx-auto mt-15 px-4 sm:px-6 lg:px-8 py-8 text-amber-100">
            <div className="bg-[#1a1108] border border-amber-900 p-4 sm:p-6 rounded-lg shadow-lg">

                <OrderHeader order={order} />

                <div className="mt-8">
                    <OrderProgressBar status={statusText} />
                </div>

                <div className="mb-6 sm:mb-8 mt-8">
                    <OrderItemList items={order.cart} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <OrderDeliveryDetails
                        userName={order.userName}
                        userEmail={order.userEmail}
                        address={order.address}
                    />
                    <OrderBillingSummary
                        subtotal={order.subtotal}
                        tax={order.tax}
                        deliveryFee={order.deliveryFee}
                        total={order.total}
                        couponCode={order.couponCode}
                        discountAmount={order.discountAmount}
                        paymentStatus={order.paymentStatus}
                    />
                </div>

                {statusText === "canceled" && (
                    <div className="mt-6 p-3 bg-red-900/30 border border-red-700 rounded-lg text-center">
                        <h3 className="text-base sm:text-xl font-bold text-red-300">
                            Order Canceled
                        </h3>
                        <p className="mt-1 text-sm">Your order has been canceled. Any payment made will be refunded within 24 hours.</p>
                    </div>
                )}

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => router.push("/user-orders")}
                        className="w-full sm:w-auto px-6 py-2.5 bg-amber-800 hover:bg-amber-700 text-white rounded-lg font-bold text-sm sm:text-base transition-colors"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        </div>
    );
}