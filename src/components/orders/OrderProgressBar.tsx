import React, { useMemo } from "react";
// Map status to a progress step number (1 to 5)
const PROGRESS_VALUES: Record<string, number> = {
    placed: 1,
    confirmed: 2,
    preparing: 3,
    out_for_delivery: 4,
    completed: 5
};

interface OrderProgressBarProps {
    status: string; // The current status of the order (e.g., "preparing")
}

/**
 * A visual progress bar that shows how far along an order is.
 * Steps: Placed -> Confirmed -> Preparing -> On the Way -> Delivered
 */
const OrderProgressBar: React.FC<OrderProgressBarProps> = ({ status }) => {
    const progressValue = useMemo(() => PROGRESS_VALUES[status] || 0, [status]);

    return (
        <div className="mb-8">
            <div className="flex justify-between mb-1 text-[0.65rem] sm:text-sm">
                <span>Placed</span>
                <span>Confirmed</span>
                <span>Preparing</span>
                <span>On the Way</span>
                <span>Delivered</span>
            </div>
            <div className="relative h-2 bg-amber-900 rounded-full">
                <div
                    className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(progressValue / 5) * 100}%` }}
                />
            </div>
            <div className="flex justify-between mt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                    <div
                        key={n}
                        className={`${n <= progressValue
                            ? "bg-primary"
                            : "bg-amber-900"
                            } flex items-center justify-center rounded-full text-[0.6rem] sm:text-xs ${n <= progressValue ? "text-white" : "text-amber-400"
                            } w-5 h-5 shadow-sm`}
                    >
                        {n <= progressValue ? "✓" : n}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderProgressBar;
