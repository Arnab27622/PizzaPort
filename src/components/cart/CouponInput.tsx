import React, { useState } from 'react';
import { toast } from 'react-toastify';
import LoadingSpinner from '@/components/icons/LoadingSpinner';
import { CouponValidationResponse } from '@/types/coupon';

import { CouponInputProps } from '@/types/cart';

export default function CouponInput({
    subtotal,
    onCouponApplied,
    onCouponRemoved,
    appliedCode,
    isDisabled
}: CouponInputProps) {
    const [code, setCode] = useState('');
    const [isValidating, setIsValidating] = useState(false);

    const handleApply = async () => {
        if (!code.trim()) {
            toast.warning('Please enter a coupon code');
            return;
        }

        setIsValidating(true);
        try {
            const res = await fetch('/api/coupon/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, subtotal }),
            });

            const data: CouponValidationResponse = await res.json();

            if (data.valid) {
                toast.success(data.message);
                onCouponApplied(data);
                setCode(''); // Clear input on success
            } else {
                toast.error(data.message || 'Invalid coupon');
            }
        } catch (error) {
            console.error('Coupon validation error:', error);
            toast.error('Failed to validate coupon');
        } finally {
            setIsValidating(false);
        }
    };

    if (appliedCode) {
        return (
            <div className="bg-green-900/20 border border-green-800 p-4 rounded-lg flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-green-700/20 p-2 rounded-full">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-green-400 font-bold tracking-wide">&apos;{appliedCode}&apos; Applied</p>
                        <p className="text-green-400/60 text-xs">Discount applied to your order</p>
                    </div>
                </div>
                <button
                    onClick={onCouponRemoved}
                    className="text-red-400 hover:text-red-300 text-sm font-medium underline px-2 py-1 hover:bg-red-900/20 rounded cursor-pointer transition-colors"
                >
                    Remove
                </button>
            </div>
        );
    }

    return (
        <div className="bg-[#1a1108] border border-amber-900 p-6 rounded-lg shadow-lg space-y-4">
            <h3 className="text-lg font-bold text-amber-50">Have a coupon?</h3>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter discount code"
                    disabled={isDisabled || isValidating}
                    className="flex-1 bg-[#2c1a0d] border border-amber-900 rounded-lg px-4 py-2 text-amber-100 placeholder:text-amber-900/50 focus:outline-hidden focus:border-primary transition-colors uppercase disabled:opacity-50"
                />
                <button
                    onClick={handleApply}
                    disabled={isDisabled || isValidating || !code.trim()}
                    className="bg-amber-700 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center min-w-25"
                >
                    {isValidating ? (
                        <LoadingSpinner size="sm" color="text-white" />
                    ) : (
                        "Apply"
                    )}
                </button>
            </div>
        </div>
    );
}
