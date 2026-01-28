import React from 'react';
import LoadingSpinner from '@/components/icons/LoadingSpinner';
import { CartTotals } from '@/types/cart';

interface OrderSummaryProps {
    totals: CartTotals;
    onSubmit: () => void;
    isProcessing: boolean;
    isDisabled: boolean;
}

export default function OrderSummary({
    totals,
    onSubmit,
    isProcessing,
    isDisabled
}: OrderSummaryProps) {
    return (
        <div className="bg-[#1a1108] border border-amber-900 p-6 rounded-lg shadow-lg space-y-4 mt-6">
            <h2 className="text-xl font-bold text-amber-50 border-b border-amber-900/50 pb-2">Order Summary</h2>
            <div className="space-y-2 text-sm font-medium text-amber-100">
                <div className="flex justify-between">
                    <span className="text-amber-200">Subtotal:</span>
                    <span>₹{totals.subtotal}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-amber-200">Tax (5%):</span>
                    <span>₹{totals.tax}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-amber-200">Delivery Fee:</span>
                    <span className={totals.deliveryFee === 0 ? "text-green-400" : ""}>
                        {totals.deliveryFee === 0 ? "Free" : `₹${totals.deliveryFee}`}
                    </span>
                </div>
                {totals.couponDiscount > 0 && (
                    <div className="flex justify-between text-green-400">
                        <span>Coupon Discount{totals.appliedCouponCode ? ` (${totals.appliedCouponCode})` : ''}:</span>
                        <span>-₹{totals.couponDiscount}</span>
                    </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-amber-800 text-primary">
                    <span>Total:</span>
                    <span>₹{totals.total}</span>
                </div>
            </div>

            <button
                onClick={onSubmit}
                disabled={isDisabled || isProcessing}
                className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-white hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2 cursor-pointer shadow-lg hover:shadow-primary/20 transform hover:-translate-y-0.5"
                aria-label={isProcessing ? "Processing your order" : "Submit order"}
            >
                {isProcessing ? (
                    <>
                        <LoadingSpinner size="sm" color="text-white" />
                        Processing...
                    </>
                ) : (
                    "Submit Order"
                )}
            </button>
        </div>
    );
}
