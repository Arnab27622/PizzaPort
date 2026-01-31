/**
 * The top section of the Order Detail page.
 * It shows the big "Order #123" title and the current status (e.g., "Preparing").
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
            <div className="text-center mb-6 md:mb-10">
                <h3 className="uppercase font-bold tracking-widest text-card text-xs md:text-sm mb-2">Order Tracking</h3>
                <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-white break-all max-w-4xl mx-auto px-2">
                    Order: <span className="text-amber-500">#{order.razorpayOrderId}</span>
                </h1>
                <div className='w-16 md:w-24 h-1 bg-primary mx-auto rounded-full mt-3 md:mt-4'></div>
            </div>

            <div className="bg-[#232323]/70 p-4 sm:p-6 md:p-8 border-b rounded border-amber-900/30">
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start md:items-center gap-4 sm:gap-6">
                    <div className="space-y-1 text-center sm:text-left">
                        <OrderStatusBadge
                            status={order.status as OrderStatus}
                            className="justify-center sm:justify-start"
                        />
                        <p className="text-amber-300/80 text-xs md:text-sm max-w-62.5 sm:max-w-none">
                            Placed on {formatDate(order.createdAt)}
                        </p>
                    </div>
                    <div className="text-center sm:text-right">
                        <p className="text-[10px] md:text-xs uppercase text-amber-500 font-bold tracking-widest mb-1">Total Amount</p>
                        <div className="text-2xl md:text-3xl font-black text-amber-50">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(order.total)}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrderHeader;
