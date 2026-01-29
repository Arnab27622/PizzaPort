import React from "react";
import { formatCurrency } from "@/lib/formatters";

interface OrderBillingSummaryProps {
    subtotal: number;
    tax: number;
    deliveryFee: number;
    total: number;
    couponCode?: string;
    discountAmount?: number;
    paymentStatus: string;
}

const OrderBillingSummary: React.FC<OrderBillingSummaryProps> = ({
    subtotal,
    tax,
    deliveryFee,
    total,
    couponCode,
    discountAmount,
    paymentStatus
}) => {
    return (
        <div className="bg-black/20 p-4 md:p-6 rounded-xl border border-amber-900/20">
            <h2 className="font-bold text-base md:text-lg mb-4 md:mb-6 flex items-center gap-2 text-amber-500 uppercase tracking-widest justify-center sm:justify-start">
                Billing Summary
            </h2>
            <div className="w-full space-y-3">
                <div className="flex justify-between items-center text-xs md:text-sm text-amber-300/80">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-xs md:text-sm text-amber-300/80">
                    <span>Tax (GST)</span>
                    <span className="font-mono">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between items-center text-xs md:text-sm text-amber-300/80">
                    <span>Delivery Fee</span>
                    <span className="font-mono">{formatCurrency(deliveryFee)}</span>
                </div>
                {couponCode && (
                    <div className="flex justify-between items-center text-xs md:text-sm text-green-400">
                        <div className="flex items-center gap-1">
                            <span>Coupon</span>
                            <span className="bg-green-900/40 px-1.5 py-0.5 rounded text-[10px] font-bold border border-green-800/50 uppercase tracking-tighter">
                                {couponCode}
                            </span>
                        </div>
                        <span className="font-mono">-{formatCurrency(discountAmount || 0)}</span>
                    </div>
                )}
                <div className="border-t border-amber-900/50 pt-3 mt-3 flex justify-between items-center text-amber-50 font-black text-lg md:text-xl">
                    <span className="text-sm md:text-lg">Total Amount</span>
                    <span>{formatCurrency(total)}</span>
                </div>

                <div className="pt-4 md:pt-6 space-y-4">
                    <div className="flex justify-between items-center bg-[#1a1108] p-3 rounded-lg border border-amber-900/30">
                        <span className="text-[10px] md:text-xs uppercase font-bold text-amber-600">Payment Status</span>
                        <span className={`text-[10px] md:text-sm font-bold uppercase tracking-wider ${paymentStatus === "refund_initiated"
                            ? "text-primary"
                            : paymentStatus === "paid" || paymentStatus === "verified"
                                ? "text-green-500"
                                : "text-amber-400"
                            }`}>
                            {paymentStatus.replace(/_/g, " ")}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderBillingSummary;
