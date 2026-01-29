import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Order, OrderStatus } from "@/types/order";
import OrderStatusBadge from "./OrderStatusBadge";

interface UserOrderCardProps {
    order: Order;
}

const UserOrderCard: React.FC<UserOrderCardProps> = ({ order }) => {
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const groupedItems = useMemo(() => {
        return order.cart.reduce((acc, item) => {
            const existing = acc.find(g => g.name === item.name);
            if (existing) {
                existing.quantity += 1;
            } else {
                acc.push({ name: item.name, quantity: 1 });
            }
            return acc;
        }, [] as Array<{ name: string; quantity: number }>);
    }, [order.cart]);

    return (
        <Link
            href={`/user-orders/${order.razorpayOrderId}`}
            className="bg-[#1a1108] border border-amber-900 rounded-lg p-6 hover:bg-[#2c1a0d] transition-colors cursor-block block"
            aria-label={`View order details for order ${order.razorpayOrderId}`}
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex items-center gap-4">
                    {order.cart[0]?.imageUrl && (
                        <div className="w-16 h-16 relative shrink-0">
                            <Image
                                src={order.cart[0].imageUrl}
                                alt={order.cart[0].name}
                                fill
                                className="object-cover rounded"
                                sizes="64px"
                            />
                        </div>
                    )}
                    <div>
                        <h2 className="text-lg font-semibold">
                            Order: #{order.razorpayOrderId.slice(0, 8)}
                        </h2>
                        <p className="text-sm text-amber-300">
                            {formatDate(order.createdAt)}
                        </p>
                    </div>
                </div>

                <div className="mt-4 md:mt-0 flex flex-col items-end">
                    <div className="text-xl font-bold">{formatCurrency(order.total)}</div>
                    <OrderStatusBadge status={order.status as OrderStatus} />
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
                {groupedItems.slice(0, 3).map((item, idx) => (
                    <span key={idx} className="text-sm bg-amber-900 px-2 py-1 rounded">
                        {item.name}{item.quantity > 1 && <span className="text-amber-300 ml-1">x{item.quantity}</span>}
                    </span>
                ))}
                {groupedItems.length > 3 && (
                    <span className="text-sm bg-amber-900 px-2 py-1 rounded">
                        +{groupedItems.length - 3} more
                    </span>
                )}
            </div>
        </Link>
    );
};

export default UserOrderCard;
