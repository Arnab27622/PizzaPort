import { useContext, useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { Order } from "@/types/order";
import { CartContext } from "@/components/CartProvider";

export function useUserOrderDetail() {
    const params = useParams<{ id?: string }>();
    const orderId = params.id;
    const router = useRouter();
    const { data: session, status: authStatus } = useSession({ required: true });
    const { clearCart } = useContext(CartContext);

    const [order, setOrder] = useState<Order | null>(null);
    const [loadingOrder, setLoadingOrder] = useState(true);
    const [statusText, setStatusText] = useState<string>('');

    const hasClearedCart = useRef(false);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

            // Clear cart for newly placed orders (one-time operation)
            if (data.status === 'placed' && !hasClearedCart.current) {
                clearCart();
                hasClearedCart.current = true;
            }

            setLoadingOrder(false);
        } catch (err: unknown) {
            console.error('Order fetch error', err);

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
        }, 10_000);

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
