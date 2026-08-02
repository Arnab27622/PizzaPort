import React from "react";
import { OrderStatus, STATUS_LABELS } from "@/types/order";

interface OrderStatusBadgeProps {
    status: OrderStatus | string;
    className?: string;
}

const BADGE_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    placed: {
        bg: "bg-amber-500/15",
        text: "text-amber-200",
        border: "border-amber-500/40",
        dot: "bg-amber-400 animate-pulse",
    },
    confirmed: {
        bg: "bg-blue-500/15",
        text: "text-blue-200",
        border: "border-blue-500/40",
        dot: "bg-blue-400 animate-pulse",
    },
    preparing: {
        bg: "bg-yellow-500/15",
        text: "text-yellow-200",
        border: "border-yellow-500/40",
        dot: "bg-yellow-400 animate-ping",
    },
    out_for_delivery: {
        bg: "bg-purple-500/15",
        text: "text-purple-200",
        border: "border-purple-500/40",
        dot: "bg-purple-400 animate-pulse",
    },
    completed: {
        bg: "bg-emerald-500/15",
        text: "text-emerald-200",
        border: "border-emerald-500/40",
        dot: "bg-emerald-400",
    },
    canceled: {
        bg: "bg-red-500/15",
        text: "text-red-300",
        border: "border-red-500/40",
        dot: "bg-red-400",
    },
};

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className = "" }) => {
    const key = (status || "placed").toLowerCase();
    const style = BADGE_STYLES[key] || BADGE_STYLES.placed;
    const label = STATUS_LABELS[key as OrderStatus] || status;

    return (
        <div className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border ${style.bg} ${style.border} ${className}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
            <span className={`text-xs sm:text-sm font-extrabold tracking-wide uppercase ${style.text}`}>
                {label}
            </span>
        </div>
    );
};

export default OrderStatusBadge;
