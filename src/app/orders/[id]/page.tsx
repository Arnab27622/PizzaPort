/**
 * This is the Admin Order Detail Page (e.g., /orders/123).
 * 
 * It shows EVERY detail about a single order:
 * - List of items ordered.
 * - Delivery address.
 * - Payment status.
 * - Option to print receipt (if we add that later).
 */

import React from "react";
import SectionHeader from "@/components/layout/SectionHeader";
import BackButton from "@/components/layout/BackButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import dbConnect from "@/lib/mongoose";
import OrderModel from "@/app/models/Orders";
import OrderHeader from "@/components/orders/OrderHeader";
import OrderItemList from "@/components/orders/OrderItemList";
import OrderDeliveryDetails from "@/components/orders/OrderDeliveryDetails";
import OrderBillingSummary from "@/components/orders/OrderBillingSummary";

import { Order, DBOrder } from "@/types/order";

export default async function OrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    let order: Order | null = null;
    let error: string | null = null;

    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            error = "Unauthorized. Please log in.";
        } else {
            await dbConnect();
            const orderDoc = await OrderModel.findById(id).lean() as DBOrder | null;

            if (!orderDoc) {
                order = null;
            } else {
                const isAdmin = session.user?.admin;
                const isOwner = orderDoc.userEmail === session.user?.email;

                if (!isAdmin && !isOwner) {
                    error = "Forbidden: You do not have permission to view this order.";
                } else {
                    order = JSON.parse(JSON.stringify(orderDoc));
                }
            }
        }
    } catch (err) {
        console.error("Error fetching order:", err);
        error = err instanceof Error ? err.message : "An unknown error occurred";
    }

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

    return (
        <div className="max-w-7xl mx-auto mt-8 px-4 py-12 text-amber-100">
            <div className="mb-6">
                <BackButton />
            </div>

            <OrderHeader order={order} />

            <div className="bg-[#1a1108] border border-amber-900/50 rounded-xl shadow-2xl overflow-hidden mt-8">
                <div className="p-4 sm:p-6 md:p-8 space-y-8 md:space-y-10">
                    <OrderItemList items={order.cart} />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
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
                </div>
            </div>
        </div>
    );
}