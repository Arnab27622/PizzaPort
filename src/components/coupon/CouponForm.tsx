import React, { useState, useEffect } from 'react';
import { Coupon } from '@/types/coupon';
import { toast } from 'react-toastify';

interface CouponFormProps {
    coupon?: Coupon | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CouponForm({ coupon, onClose, onSuccess }: CouponFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage', // 'percentage' | 'fixed'
        discountValue: '',
        minOrderValue: '',
        maxDiscount: '',
        expiryDate: '',
        usageLimit: '',
        isActive: true
    });

    useEffect(() => {
        if (coupon) {
            setFormData({
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue.toString(),
                minOrderValue: coupon.minOrderValue?.toString() || '',
                maxDiscount: coupon.maxDiscount?.toString() || '',
                expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
                usageLimit: coupon.usageLimit?.toString() || '',
                isActive: coupon.isActive
            });
        }
    }, [coupon]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const method = coupon ? 'PUT' : 'POST';
            const body = {
                ...formData,
                id: coupon?._id,
                // Optional fields should be undefined if empty string
                minOrderValue: formData.minOrderValue || undefined,
                maxDiscount: formData.maxDiscount || undefined,
                expiryDate: formData.expiryDate || undefined,
                usageLimit: formData.usageLimit || undefined,
            };

            const response = await fetch('/api/coupon', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to save coupon');
            }

            toast.success(`Coupon ${coupon ? 'updated' : 'created'} successfully`);
            onSuccess();
        } catch (error) {
            console.error('Error saving coupon:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to save coupon');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
            <div className="bg-[#3A3D40] text-[#F9FBF7] rounded-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700">
                <div className="flex justify-between items-center mb-6 border-b border-gray-600 pb-3">
                    <h3 className="text-2xl font-semibold text-amber-50">
                        {coupon ? "Edit Coupon" : "New Coupon"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors text-2xl leading-none cursor-pointer"
                    >
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Code & Type */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Coupon Code</label>
                            <input
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                placeholder="E.g. SALE20"
                                required
                                className="w-full bg-[#2F3234] border border-[#555] text-[#F9FBF7] p-3 rounded-md focus:border-amber-500 focus:ring-1 focus:ring-amber-500 uppercase transition-all outline-hidden"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Discount Type</label>
                            <select
                                name="discountType"
                                value={formData.discountType}
                                onChange={handleChange}
                                className="w-full bg-[#2F3234] border border-[#555] text-[#F9FBF7] p-3 rounded-md focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all outline-hidden"
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (₹)</option>
                            </select>
                        </div>
                    </div>

                    {/* Value & Min Order */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">
                                Discount Value {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
                            </label>
                            <input
                                name="discountValue"
                                type="number"
                                min="0"
                                value={formData.discountValue}
                                onChange={handleChange}
                                placeholder="20"
                                required
                                className="w-full bg-[#2F3234] border border-[#555] text-[#F9FBF7] p-3 rounded-md focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all outline-hidden"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Min Order Value (₹)</label>
                            <input
                                name="minOrderValue"
                                type="number"
                                min="0"
                                value={formData.minOrderValue}
                                onChange={handleChange}
                                placeholder="Optional"
                                className="w-full bg-[#2F3234] border border-[#555] text-[#F9FBF7] p-3 rounded-md focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all outline-hidden"
                            />
                        </div>
                    </div>

                    {/* Max Discount & Expiry */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">
                                Max Discount (₹)
                                {formData.discountType === 'fixed' && <span className="text-xs text-gray-500 ml-1">(Ignore)</span>}
                            </label>
                            <input
                                name="maxDiscount"
                                type="number"
                                min="0"
                                value={formData.maxDiscount}
                                onChange={handleChange}
                                disabled={formData.discountType === 'fixed'}
                                placeholder={formData.discountType === 'percentage' ? "Optional limit" : "N/A"}
                                className="w-full bg-[#2F3234] border border-[#555] text-[#F9FBF7] p-3 rounded-md focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:opacity-50 transition-all outline-hidden"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Usage Limit</label>
                            <input
                                name="usageLimit"
                                type="number"
                                min="0"
                                value={formData.usageLimit}
                                onChange={handleChange}
                                placeholder="Optional (e.g. 100)"
                                className="w-full bg-[#2F3234] border border-[#555] text-[#F9FBF7] p-3 rounded-md focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all outline-hidden"
                            />
                        </div>
                    </div>

                    {/* Expiry Date */}
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Expiry Date</label>
                        <input
                            name="expiryDate"
                            type="date"
                            value={formData.expiryDate}
                            onChange={handleChange}
                            className="w-full bg-[#2F3234] border border-[#555] text-[#F9FBF7] p-3 rounded-md focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all outline-hidden scheme-dark"
                        />
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            className="w-5 h-5 accent-amber-600 cursor-pointer"
                        />
                        <label htmlFor="isActive" className="text-sm cursor-pointer select-none">
                            Is Active? (Uncheck to disable)
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-600">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-md border border-gray-500 hover:bg-gray-700 text-gray-300 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 bg-linear-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white rounded-md font-medium shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                    Saving...
                                </>
                            ) : (
                                coupon ? "Update Coupon" : "Create Coupon"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
