/**
 * This custom hook handles the entire checkout and payment process.
 * It talks to our server to create an order and then opens the Razorpay
 * payment window for the user.
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { UseCartPaymentProps } from '@/types/cart';
import { RazorpayResponse, RazorpayOptions } from '@/types/payment';

/**
 * useCartPayment Hook
 * Takes all the checkout data (cart, address, user info) and handles payment processing.
 */
export function useCartPayment({
    cartProducts,
    address,
    userName,
    userEmail,
    clearCart,
    couponCode,
    discountAmount
}: UseCartPaymentProps) {
    const [isProcessing, setIsProcessing] = useState(false); // True when payment logic is running
    const router = useRouter();

    /**
     * The main function called when the user clicks "Pay Now".
     */
    const handleSubmitOrder = useCallback(async () => {
        // Prevent submission if cart is empty or address is missing
        if (cartProducts.length === 0 || !address.trim()) return;

        setIsProcessing(true);
        try {
            // 1. Prepare the cart data for the server
            const trimmedCart = cartProducts.map((item) => ({
                _id: item._id,
                name: item.name,
                imageUrl: item.imageUrl,
                basePrice: item.basePrice,
                discountPrice: item.discountPrice,
                size: item.size
                    ? { name: item.size.name, extraPrice: item.size.extraPrice }
                    : null,
                extras: item.extras
                    ? item.extras.map((e) => ({ name: e.name, extraPrice: e.extraPrice }))
                    : [],
            }));

            // 2. Create an order on our server
            const resp = await fetch("/api/razorpay", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: userName,
                    email: userEmail,
                    address,
                    cart: trimmedCart,
                    couponCode,
                    discountAmount
                }),
            });

            if (!resp.ok) throw new Error("Failed to create order");

            const order = await resp.json();

            // 3. Ensure Razorpay is ready
            if (!order?.razorpayOrderId || typeof order.amount !== "number") {
                toast.error("Failed to create Razorpay order");
                return;
            }

            if (typeof window.Razorpay === "undefined") {
                toast.error("Payment system is not available");
                return;
            }

            // 4. Configure the Razorpay payment window
            const options: RazorpayOptions = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
                amount: order.amount,
                currency: "INR",
                name: "PizzaPort",
                description: "Order Payment",
                order_id: order.razorpayOrderId,
                handler: async function (response: RazorpayResponse) {
                    // This runs AFTER the user pays. We must verify it on our server.
                    try {
                        const verifyResp = await fetch("/api/verify-payment", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                ...response,
                                orderId: order.razorpayOrderId,
                                securityHash: order.securityHash,
                            }),
                        });

                        const verifyResult = await verifyResp.json();

                        if (verifyResult.success) {
                            toast.success("Payment verified and successful!");
                            clearCart(); // Empty the cart
                            router.push(`/user-orders/${order.razorpayOrderId}`); // Go to the order tracking page
                        } else {
                            toast.error("Payment verification failed!");
                        }
                    } catch (err) {
                        console.error("Payment verification error:", err);
                        toast.error("Payment verification failed");
                    }
                },
                prefill: {
                    name: userName,
                    email: userEmail,
                },
                theme: { color: "#F59E0B" },
            };

            // 5. Open the payment window
            const rzp = new window.Razorpay(options);

            rzp.on("payment.failed", function (response) {
                toast.error(`Payment failed: ${response.error.description}`);
            });

            rzp.open();
        } catch (error) {
            console.error("Order submission error:", error);
            toast.error("Failed to process your order. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    }, [cartProducts, address, userName, userEmail, clearCart, router, couponCode, discountAmount]);

    return { handleSubmitOrder, isProcessing };
}

