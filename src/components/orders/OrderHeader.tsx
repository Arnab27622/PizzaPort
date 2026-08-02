/**
 * The top section of the Order Detail page.
 * It shows the big "Order #123" title and the current status badge.
 */

import React from "react";
import OrderStatusBadge from "./OrderStatusBadge";
import { Order, OrderStatus } from "@/types/order";
import { formatDate } from "@/lib/formatters";

interface OrderHeaderProps {
    order: Order; // The order object containing ID, status, and date
}

const OrderHeader: React.FC<OrderHeaderProps> = ({ order }) => {
    return (
        <>
            <div className="text-center mb-6 md:mb-8">
                <h3 className="uppercase font-extrabold tracking-widest text-amber-400 text-xs md:text-sm mb-2">
                    Order Tracking
                </h3>
                <h1 className="text-2xl md:text-4xl font-extrabold text-white break-all max-w-4xl mx-auto px-2">
                    Order <span className="text-amber-400 font-mono">#{order.razorpayOrderId}</span>
                </h1>
                <div className="w-16 md:w-24 h-1 bg-linear-to-r from-amber-500 to-orange-500 mx-auto rounded-full mt-3 md:mt-4 shadow-lg"></div>
            </div>

            <div className="bg-[#18120c]/95 p-5 sm:p-7 md:p-8 border border-amber-900/50 rounded-2xl shadow-2xl backdrop-blur-md">
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start md:items-center gap-5 sm:gap-6">
                    <div className="space-y-2.5 text-center sm:text-left">
                        <div className="flex justify-center sm:justify-start">
                            <OrderStatusBadge status={order.status as OrderStatus} />
                        </div>
                        <p className="text-amber-100 font-semibold text-sm sm:text-base">
                            Placed on {formatDate(order.createdAt)}
                        </p>
                    </div>
                    <div className="text-center sm:text-right bg-[#140e08]/90 px-6 py-3.5 rounded-xl border border-amber-900/40 shadow-inner min-w-[160px]">
                        <p className="text-[11px] md:text-xs uppercase text-amber-400 font-extrabold tracking-widest mb-1">
                            Total Amount
                        </p>
                        <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(order.total)}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrderHeader;
