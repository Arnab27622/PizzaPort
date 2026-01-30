/**
 * This custom hook manages the "Order Details" page for a customer.
 * It fetches the order data, automatically clears the cart after a purchase,
 * and keeps checking the server for status updates (like "Preparing" or "Out for Delivery").
 */

import { useContext, useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { Order } from "@/types/order";
import { CartContext } from "@/components/CartProvider";

/**
 * useUserOrderDetail Hook
 */
export function useUserOrderDetail() {
    const params = useParams<{ id?: string }>(); // Get the Order ID from the URL
    const orderId = params.id;
    const router = useRouter();
    const { data: session, status: authStatus } = useSession({ required: true });
    const { clearCart } = useContext(CartContext);

    const [order, setOrder] = useState<Order | null>(null); // The order data
    const [loadingOrder, setLoadingOrder] = useState(true); // True while first loading
    const [statusText, setStatusText] = useState<string>(''); // Current status (e.g., "preparing")

    const hasClearedCart = useRef(false); // To ensure we only empty the cart once per order
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null); // For the automatic status checker
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null); // For retrying if the server is slow

    /**
     * Fetches the order details from the database.
     */
    const fetchOrder = useCallback(async (isRetry = false) => {
        if (!orderId) return;

        try {
            if (!isRetry) {
                setLoadingOrder(true);
            }

            const res = await fetch(`/api/user-orders/${orderId}`);

            if (!res.ok) {
                throw new Error('Failed to fetch order');
            }

            const data = await res.json();

            if (data.success === false) {
                throw new Error(data.error || 'Failed to fetch order');
            }

            setOrder(data as Order);
            setStatusText(data.status);

            // 1. CLEAR CART: If the order was just placed, empty the shopping cart.
            if (data.status === 'placed' && !hasClearedCart.current) {
                clearCart();
                hasClearedCart.current = true;
            }

            setLoadingOrder(false);
        } catch (err: unknown) {
            console.error('Order fetch error', err);

            // If it fails, try again once after 2 seconds (sometimes database updates are slow)
            if (!isRetry) {
                if (retryTimeoutRef.current) {
                    clearTimeout(retryTimeoutRef.current);
                }

                retryTimeoutRef.current = setTimeout(() => {
                    fetchOrder(true);
                }, 2000);
            } else {
                toast.info('Order data is taking longer than expected to load...');
            }
        }
    }, [orderId, clearCart]);

    /**
     * Initial startup: Check if user is logged in, then fetch the order.
     */
    useEffect(() => {
        if (authStatus === 'loading') return;

        if (!session) {
            router.replace('/login');
            return;
        }

        if (!orderId) {
            setLoadingOrder(false);
            return;
        }

        fetchOrder();

        return () => {
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, [authStatus, session, router, orderId, fetchOrder]);

    /**
     * POLLING: Every 10 seconds, check the server to see if the status has changed.
     * This stops once the order is "delivered" or "canceled".
     */
    useEffect(() => {
        if (!order || /^(completed|canceled)$/.test(statusText)) return;

        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }

        pollingIntervalRef.current = setInterval(async () => {
            try {
                const res = await fetch(`/api/user-orders/${orderId}/status`);
                if (!res.ok) return;

                const { status: newStatus } = await res.json();

                // If the status changed on the server, update the screen
                if (newStatus && newStatus !== statusText) {
                    setStatusText(newStatus);

                    if (newStatus === 'completed') {
                        toast.info('Order delivered! Redirecting...');
                        setTimeout(() => router.push('/user-orders'), 2000);
                    }
                }
            } catch (err) {
                console.error('Polling failed', err);
            }
        }, 10_000); // 10 seconds

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [orderId, order, statusText, router]);

    return {
        order,
        loading: authStatus === 'loading' || loadingOrder,
        statusText,
        fetchOrder
    };
}

