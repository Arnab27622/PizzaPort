import React from "react";
import { OrderStatus, STATUS_LABELS, STATUS_RANK } from "@/types/order";

interface OrderStatusSelectorProps {
    status: OrderStatus;
    onChange: (status: OrderStatus, e: React.ChangeEvent<HTMLSelectElement>) => void;
    disabled?: boolean;
}

const OrderStatusSelector: React.FC<OrderStatusSelectorProps> = ({ status, onChange, disabled }) => {
    const isCompletedOrCanceled = status === "completed" || status === "canceled";

    return (
        <select
            value={status}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onChange(e.target.value as OrderStatus, e)}
            className={`w-full bg-[#1a1108] border border-amber-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all pointer-events-auto ${isCompletedOrCanceled
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer border-amber-700 hover:border-primary"
                }`}
            disabled={disabled || isCompletedOrCanceled}
        >
            {Object.entries(STATUS_LABELS)
                .filter(([value]) => value !== "canceled" || status === "canceled")
                .map(([value, label]) => {
                    const isPreviousStatus = STATUS_RANK[value as OrderStatus] < STATUS_RANK[status];
                    return (
                        <option
                            key={value}
                            value={value}
                            disabled={isPreviousStatus}
                        >
                            {label}
                        </option>
                    );
                })}
        </select>
    );
};

export default OrderStatusSelector;
