'use client';

import React from 'react';
import useSWR from 'swr';
import SectionHeader from '@/components/layout/SectionHeader';
import LoadingSpinner from '@/components/icons/LoadingSpinner';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import TicketIcon from '@/components/icons/TicketIcon';
import { UserCoupon } from '@/types/coupon';

const fetcher = (url: string) => fetch(url).then(res => res.json());


export default function UserCouponsPage() {
    const { status: authStatus } = useSession();
    const router = useRouter();

    const { data: coupons, isLoading } = useSWR<UserCoupon[]>(
        authStatus === 'authenticated' ? '/api/user-coupons' : null,
        fetcher
    );

    if (authStatus === 'loading' || isLoading) {
        return (
            <div className="max-w-7xl mx-auto mt-24 px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="lg" color="text-primary" />
                <p className="mt-4 text-amber-200 animate-pulse">Fetching exclusive deals for you...</p>
            </div>
        );
    }

    if (authStatus === 'unauthenticated') {
        router.push('/login');
        return null;
    }

    return (
        <section className="max-w-7xl mx-auto mt-16 px-4 py-12">
            <SectionHeader subHeader="Exclusive Deals" mainHeader="My Coupons" />

            <div className="mt-12">
                {!coupons || coupons.length === 0 ? (
                    <div className="text-center py-20 bg-[#1a1108]/50 rounded-2xl border border-amber-900/30 backdrop-blur-sm">
                        <div className="text-5xl mb-4 text-amber-900/50">🎫</div>
                        <p className="text-amber-200 text-xl font-medium">No coupons available right now.</p>
                        <p className="text-amber-400/60 mt-2">Check back soon for special offers!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {coupons.map((coupon) => (
                            <div
                                key={coupon._id}
                                className={`group relative overflow-hidden bg-linear-to-br from-[#2c1a0d] to-[#1a1108] border ${coupon.remainingUses === 0 ? 'border-red-900/30 opacity-75' : 'border-amber-900/50'} rounded-2xl shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-primary/10`}
                            >
                                {/* Decorative Background Elements */}
                                <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
                                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all duration-700" />

                                <div className="p-6 relative z-10">
                                    {/* Header: Code & Status */}
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-2">
                                            <TicketIcon className="w-5 h-5 text-primary" />
                                            <span className="text-xs uppercase tracking-widest font-bold text-amber-500/80">Premium Offer</span>
                                        </div>
                                        {coupon.remainingUses === 0 ? (
                                            <span className="bg-red-900/40 text-red-400 text-[10px] font-black px-2 py-1 rounded-full border border-red-800/50 uppercase tracking-tighter">
                                                Fully Used
                                            </span>
                                        ) : (
                                            <span className="bg-green-900/40 text-green-400 text-[10px] font-black px-2 py-1 rounded-full border border-green-800/50 uppercase tracking-tighter">
                                                Available
                                            </span>
                                        )}
                                    </div>

                                    {/* Discount Value */}
                                    <div className="mb-6">
                                        <h3 className="text-4xl font-black text-amber-50 group-hover:text-white transition-colors">
                                            {coupon.discountType === 'percentage'
                                                ? <>{coupon.discountValue}% <span className="text-lg font-bold text-amber-500">OFF</span></>
                                                : <><span className="text-lg font-bold text-amber-500">₹</span>{coupon.discountValue} <span className="text-lg font-bold text-amber-500">OFF</span></>
                                            }
                                        </h3>
                                        <p className="text-amber-200/60 text-sm mt-1 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                                            {coupon.minOrderValue ? `On orders above ₹${coupon.minOrderValue}` : 'No minimum order required'}
                                        </p>
                                    </div>

                                    {/* Promo Code Box */}
                                    <div className="bg-black/40 border border-amber-900/50 p-4 rounded-xl mb-6 relative group-hover:border-primary/50 transition-colors">
                                        <div className="text-[10px] uppercase text-amber-600 font-bold tracking-tighter absolute -top-2 left-3 bg-[#23150b] px-2 border-l border-r border-amber-900/50">
                                            Promo Code
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xl font-mono font-bold tracking-widest text-white">{coupon.code}</span>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(coupon.code);
                                                    alert('Code copied!');
                                                }}
                                                className="text-[10px] uppercase font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer"
                                            >
                                                Copy Code
                                            </button>
                                        </div>
                                    </div>

                                    {/* Footer Info */}
                                    <div className="space-y-3 pt-4 border-t border-amber-900/30">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] uppercase text-amber-500/50 font-bold">Usage Status</span>
                                            <span className="text-xs font-bold text-amber-200">
                                                {coupon.usageLimit
                                                    ? `${coupon.userUsageCount} used / ${coupon.usageLimit} limit`
                                                    : `${coupon.userUsageCount} times used`
                                                }
                                            </span>
                                        </div>

                                        {coupon.remainingUses !== null && (
                                            <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${coupon.remainingUses === 0 ? 'bg-red-500' : 'bg-primary'}`}
                                                    style={{ width: `${(coupon.userUsageCount / (coupon.usageLimit || 1)) * 100}%` }}
                                                />
                                            </div>
                                        )}

                                        {coupon.expiryDate && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] uppercase text-amber-500/50 font-bold">Valid Until</span>
                                                <span className="text-[10px] font-bold text-amber-300">
                                                    {new Date(coupon.expiryDate).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
