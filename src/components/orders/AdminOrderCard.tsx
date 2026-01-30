/**
 * This card is used by Admins to view a summary of an order.
 * It shows key info like Order ID, Customer Name, Address, and Total Price.
 * Admins can also quickly change the order status (e.g., to "Preparing") or cancel it directly from this card.
 */

import React from "react";
import Link from "next/link";
import LocationIcon from "@/components/icons/LocationIcon";
import LoadingSpinner from "@/components/icons/LoadingSpinner";
import { Order, OrderStatus, STATUS_COLORS } from "@/types/order";
import OrderStatusSelector from "./OrderStatusSelector";

interface AdminOrderCardProps {
    order: Order; // The order to display
    isUpdating: boolean; // True if status is currently being saved
    isCanceling: boolean; // True if order is currently being canceled
    onStatusChange: (orderId: string, status: OrderStatus, e: React.ChangeEvent<HTMLSelectElement>) => void; // Function to update status
    onCancel: (orderId: string, e: React.MouseEvent) => void; // Function to cancel order
}

const AdminOrderCard: React.FC<AdminOrderCardProps> = ({
    order,
    isUpdating,
    isCanceling,
    onStatusChange,
    onCancel
}) => {

    return (
        <div className="relative p-4 sm:p-6 hover:bg-[#3a281a] transition-all active:bg-[#4a382a] group">
            <Link
                href={`/orders/${order._id}`}
                className="absolute inset-0 z-10"
                aria-label={`View details for order ${order.razorpayOrderId}`}
            />

            <div className="relative z-20 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pointer-events-none">
                <div className="flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-start gap-4">
                        <div className="min-w-0">
                            <h3 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Order ID</h3>
                            <Link
                                href={`/orders/${order._id}`}
                                className="font-mono text-sm text-amber-100 break-all bg-black/20 px-2 py-1.5 rounded border border-amber-900/30 hover:border-primary/50 transition-colors block pointer-events-auto"
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            >
                                {order.razorpayOrderId}
                            </Link>
                        </div>
                        <div className="sm:text-right lg:text-left lg:ml-8">
                            <div className="text-2xl font-black text-amber-50">₹{order.total}</div>
                            <div className="text-[10px] text-amber-400/60 font-medium">
                                {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-900/50 flex items-center justify-center shrink-0 border border-amber-700/30">
                                <span className="text-amber-300 text-sm font-bold uppercase">{order.userName.charAt(0)}</span>
                            </div>
                            <div className="min-w-0">
                                <div className="font-bold text-amber-100 truncate">{order.userName}</div>
                                <div className="text-xs text-amber-400/70 truncate">{order.userEmail}</div>
                            </div>
                        </div>

                        <div className="text-sm text-amber-200/80 bg-black/10 p-2.5 rounded-md flex gap-2 items-start hover:bg-black/20 transition-colors">
                            <LocationIcon />
                            <span className="line-clamp-2 md:line-clamp-1 lg:line-clamp-2" title={order.address}>{order.address}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="bg-amber-900/40 px-3 py-1 rounded-full border border-amber-800/30 text-xs text-amber-300 font-semibold">
                                {order.cart.length} Item{order.cart.length !== 1 ? 's' : ''} Packed
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:min-w-50">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                            {isUpdating ? (
                                <LoadingSpinner size="xs" color="text-primary" />
                            ) : (
                                <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[order.status as OrderStatus]}`} />
                            )}
                            <span className="text-[10px] font-bold text-amber-400/80 uppercase tracking-tighter">Current Status</span>
                        </div>
                        <OrderStatusSelector
                            status={order.status as OrderStatus}
                            onChange={(status, e) => onStatusChange(order._id, status, e)}
                            disabled={isUpdating}
                        />
                    </div>

                    <div className="flex-1 flex flex-col justify-end">
                        {order.status === "canceled" ? (
                            <div className="w-full py-2.5 text-center text-red-500 font-bold text-xs border border-red-500/20 rounded-lg bg-red-500/5 uppercase tracking-widest">
                                Canceled
                            </div>
                        ) : order.status === "completed" ? (
                            <div className="w-full py-2.5 text-center text-green-500 font-bold text-xs border border-green-500/20 rounded-lg bg-green-500/5 uppercase tracking-widest">
                                Completed
                            </div>
                        ) : (
                            <button
                                onClick={(e) => onCancel(order._id, e)}
                                disabled={isCanceling}
                                className="w-full bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white font-bold py-2.5 rounded-lg border border-red-600/30 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider pointer-events-auto"
                            >
                                {isCanceling ? (
                                    <LoadingSpinner size="xs" color="text-white" />
                                ) : (
                                    <>Cancel Order</>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderCard;
