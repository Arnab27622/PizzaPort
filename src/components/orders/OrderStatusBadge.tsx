import React from "react";
import { OrderStatus, STATUS_COLORS, STATUS_LABELS } from "@/types/order";

interface OrderStatusBadgeProps {
    status: OrderStatus;
    className?: string;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className = "" }) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[status]}`} />
            <span className="text-[10px] font-bold text-amber-400/80 uppercase tracking-tighter">
                {STATUS_LABELS[status] || status}
            </span>
        </div>
    );
};

export default OrderStatusBadge;
