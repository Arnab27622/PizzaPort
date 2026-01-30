/**
 * This is the Admin Coupon Management Page.
 * 
 * Admins use this to manage discount codes:
 * 1. Create new coupons (e.g., "SUMMER20").
 * 2. Set discount amount (Percentage or Fixed).
 * 3. Set expiry dates and usage limits.
 */

"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import BackButton from "@/components/layout/BackButton";
import LoadingSpinner from "@/components/icons/LoadingSpinner";
import { confirm } from "@/components/layout/ConfirmDelete";
import { useIsAdmin } from "@/hooks/useAdmin";
import { Coupon } from "@/types/coupon";
import CouponForm from "@/components/coupon/CouponForm";
import CouponList from "@/components/coupon/CouponList";

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch coupons");
    }
    return res.json();
};

export default function CouponsPage() {
    const router = useRouter();
    const { isAdmin, isLoading: isAdminLoading } = useIsAdmin();

    const {
        data,
        isLoading: swrLoading,
        mutate,
        error: swrError
    } = useSWR<Coupon[]>("/api/coupon", fetcher, {
        refreshInterval: 15000, // Refresh every 15 seconds
        onError: (err) => console.error("Failed to fetch coupons:", err)
    });

    const coupons = useMemo(() => Array.isArray(data) ? data : [], [data]);

    // State
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Redirect if not admin
    useEffect(() => {
        if (!isAdminLoading && !isAdmin) router.replace("/");
    }, [isAdminLoading, isAdmin, router]);

    useEffect(() => {
        if (swrError) {
            toast.error(swrError.message || "Failed to fetch coupons");
        }
    }, [swrError]);

    const handleCreateClick = useCallback(() => {
        setEditingCoupon(null);
        setModalOpen(true);
    }, []);

    const handleEditClick = useCallback((coupon: Coupon) => {
        setEditingCoupon(coupon);
        setModalOpen(true);
    }, []);

    const handleDeleteClick = useCallback(async (coupon: Coupon) => {
        try {
            const ok = await confirm({ message: `Delete coupon "${coupon.code}"?` });
            if (ok) {
                setDeletingId(coupon._id);
                const response = await fetch("/api/coupon", {
                    method: "DELETE",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: coupon._id })
                });

                if (!response.ok) {
                    throw new Error('Failed to delete coupon');
                }

                toast.success("Coupon deleted successfully");
                mutate();
            }
        } catch (err) {
            console.error("Error deleting coupon:", err);
            toast.error("Failed to delete coupon");
        } finally {
            setDeletingId(null);
        }
    }, [mutate]);

    const handleFormSuccess = useCallback(() => {
        mutate();
        setModalOpen(false);
    }, [mutate]);

    if (isAdminLoading || swrLoading) {
        return (
            <div className="min-h-[80vh] text-card p-6 lg:py-6 lg:px-15 mt-16 max-w-7xl mx-auto">
                <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <h1 className="text-3xl font-bold heading-border text-amber-50">Manage Coupons</h1>
                </header>
                <div className="flex flex-col items-center justify-center mt-32">
                    <LoadingSpinner size="lg" color="text-primary" />
                    <p className="mt-4 text-amber-200">Loading coupons...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="min-h-[80vh] text-card p-6 lg:py-6 lg:px-15 mt-16 max-w-7xl mx-auto">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <h1 className="text-3xl font-bold heading-border underline text-amber-50">Manage Coupons</h1>
                <div className="flex flex-row justify-between items-center w-full sm:w-auto gap-4">
                    <BackButton label="Back" />
                    <button
                        onClick={handleCreateClick}
                        className="bg-[#FF5500] hover:bg-[#e14a00] text-white px-4.5 py-2 rounded-sm hover:bg-primary-dark transition-all shadow-lg hover:shadow-primary/20 transform hover:-translate-y-0.5 font-semibold cursor-pointer flex items-center gap-2"
                    >
                        <span className="text-xl leading-none">+</span> New Coupon
                    </button>
                </div>
            </header>

            <CouponList
                coupons={coupons}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                isDeletingId={deletingId}
            />

            {/* Form Modal */}
            {modalOpen && (
                <CouponForm
                    coupon={editingCoupon}
                    onClose={() => setModalOpen(false)}
                    onSuccess={handleFormSuccess}
                />
            )}
        </div>
    );
}
