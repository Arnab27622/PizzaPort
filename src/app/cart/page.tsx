"use client";

import React, { useContext, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { CartContext } from "@/components/AppContext";
import BackButton from "@/components/layout/BackButton";
import LoadingSpinner from "@/components/icons/LoadingSpinner";

import CartItemList from "@/components/cart/CartItemList";
import DeliveryForm from "@/components/cart/DeliveryForm";
import OrderSummary from "@/components/cart/OrderSummary";

import { useUserLocation } from "@/hooks/useUserLocation";
import { useCartCalculations } from "@/hooks/useCartCalculations";
import { useCartPayment } from "@/hooks/useCartPayment";

const CartSchema = z.object({
    address: z.string().min(1, 'Address is required').min(5, 'Please provide a more detailed address').max(200, 'Address is too long'),
});

import CouponInput from "@/components/cart/CouponInput";
import { CouponValidationResponse } from "@/types/coupon";
import { CartFormState } from "@/types/cart";

export default function CartPage() {
    const { cartProducts, removeCartProduct, clearCart } = useContext(CartContext);
    const { data: session, status } = useSession();
    const router = useRouter();

    // Coupon State
    const [couponDiscount, setCouponDiscount] = React.useState(0);
    const [appliedCouponCode, setAppliedCouponCode] = React.useState<string | undefined>(undefined);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<CartFormState>({
        resolver: zodResolver(CartSchema),
        mode: 'onChange'
    });

    const {
        isFetchingLocation,
        fetchUserLocation
    } = useUserLocation(setValue);

    const address = watch('address');

    const { totals, groupedItems } = useCartCalculations(cartProducts, couponDiscount);

    // Update totals with applied coupon code for display (handled in hook via calculations, but we need to pass the code to summary if we want)
    // Actually totals object has appliedCouponCode field but we aren't setting it in the hook.
    // We can just augment the totals object before passing it or rely on the hook if updated properly.
    // The hook returns totals with couponDiscount. The appliedCouponCode is in local state.
    const totalsWithCode = { ...totals, appliedCouponCode };

    const userName = session?.user?.name || "";
    const userEmail = session?.user?.email || "";

    const { handleSubmitOrder, isProcessing } = useCartPayment({
        cartProducts,
        address,
        userName,
        userEmail,
        clearCart,
        couponCode: appliedCouponCode,
        discountAmount: couponDiscount
    });

    // Handle coupon application
    const handleCouponApplied = (response: CouponValidationResponse) => {
        if (response.discount !== undefined) {
            setCouponDiscount(response.discount);
            setAppliedCouponCode(response.coupon?.code);
        }
    };

    const handleCouponRemoved = () => {
        setCouponDiscount(0);
        setAppliedCouponCode(undefined);
    };

    // Authentication Check
    useEffect(() => {
        if (status === "unauthenticated") {
            toast.error("Please log in to access your cart");
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="max-w-7xl mx-auto mt-10 px-4 py-12 text-amber-100 min-h-[80vh] flex flex-col items-center justify-center">
                <LoadingSpinner size="lg" color="text-primary" />
                <p className="mt-4 text-amber-300">Loading your cart...</p>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="max-w-7xl mx-auto mt-10 px-4 py-12 text-amber-100 min-h-[80vh] flex flex-col items-center justify-center">
                <LoadingSpinner size="lg" color="text-primary" />
                <p className="mt-4 text-amber-300">Redirecting to login...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto mt-10 px-4 py-12 text-amber-100 grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column */}
            <div className="col-span-1 lg:col-span-2 mb-6">
                <BackButton />
            </div>

            <div>
                <h1 className="text-2xl font-bold heading-border underline mb-6 text-card">Your Items</h1>
                <CartItemList
                    groupedItems={groupedItems}
                    onRemove={removeCartProduct}
                />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
                <DeliveryForm
                    userName={userName}
                    userEmail={userEmail}
                    register={register}
                    errors={errors}
                    onFetchLocation={fetchUserLocation}
                    isFetchingLocation={isFetchingLocation}
                />

                <CouponInput
                    subtotal={totals.subtotal}
                    onCouponApplied={handleCouponApplied}
                    onCouponRemoved={handleCouponRemoved}
                    appliedCode={appliedCouponCode}
                    isDisabled={cartProducts.length === 0}
                />

                <OrderSummary
                    totals={totalsWithCode}
                    onSubmit={handleSubmit(handleSubmitOrder)}
                    isProcessing={isProcessing}
                    isDisabled={cartProducts.length === 0}
                />
            </div>
        </div>
    );
}