import React from 'react';
import { CouponListProps } from '@/types/coupon';
import TrashIcon from '../icons/TrashIcon';

export default function CouponList({ coupons, onEdit, onDelete, isDeletingId }: CouponListProps) {
    if (!coupons.length) {
        return (
            <div className="text-center py-20 bg-[#1a1108]/50 rounded-xl border border-amber-900/30">
                <p className="text-amber-200 text-lg">No coupons found.</p>
                <p className="text-amber-400/60 text-sm mt-2">Create your first coupon to get started!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => (
                <div
                    key={coupon._id}
                    className={`bg-linear-to-br from-[#2c1a0d] to-[#1a1108] border ${coupon.isActive ? 'border-amber-900' : 'border-red-900/50 opacity-75'} rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}
                >
                    <div className="p-5 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-md shadow-inner tracking-wider">
                                {coupon.code}
                            </div>
                            <div className={`text-xs font-bold px-2 py-1 rounded-full ${coupon.isActive ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-red-900/50 text-red-400 border border-red-800'}`}>
                                {coupon.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </div>
                        </div>

                        <div className="grow space-y-2 mb-6">
                            <div className="text-2xl font-bold text-amber-50">
                                {coupon.discountType === 'percentage'
                                    ? <>{coupon.discountValue}% OFF</>
                                    : <>₹{coupon.discountValue} OFF</>
                                }
                            </div>

                            <p className="text-sm text-amber-200/70">
                                {coupon.minOrderValue ? `Min order: ₹${coupon.minOrderValue}` : 'No min order'}
                                {coupon.discountType === 'percentage' && coupon.maxDiscount ? ` • Max: ₹${coupon.maxDiscount}` : ''}
                            </p>

                            <p className="text-xs text-amber-200/50 mt-2">
                                Total uses: <span className="text-amber-100">{coupon.usageCount}</span>
                                {coupon.usageLimit ? <span> • Limit: <span className="text-amber-100">{coupon.usageLimit}</span> per user</span> : ''}
                            </p>

                            {coupon.expiryDate && (
                                <p className="text-xs text-amber-200/50">
                                    Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3 mt-auto">
                            <button
                                onClick={() => onEdit(coupon)}
                                className="flex-1 py-2 bg-amber-900/50 hover:bg-amber-800/50 border border-amber-800 rounded-lg text-amber-100 text-sm font-medium transition-colors cursor-pointer"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => onDelete(coupon)}
                                disabled={isDeletingId === coupon._id}
                                className="px-3 py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 rounded-lg text-red-400 hover:text-red-300 transition-colors cursor-pointer disabled:opacity-50"
                                aria-label="Delete coupon"
                            >
                                {isDeletingId === coupon._id ? (
                                    <span className="w-5 h-5 block border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                    <TrashIcon />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
