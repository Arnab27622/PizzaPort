/**
 * This custom hook manages the list of all orders placed by the current User.
 * It shows their order history and updates automatically if something changes.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Order, OrderStatus } from "@/types/order";
import { useOrderSocket } from "./useOrderSocket";

/**
 * useUserOrders Hook
 */
export function useUserOrders() {
    const { status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]); // The list of orders from the database
    const [loading, setLoading] = useState(true);      // True while loading for the first time
    const [error, setError] = useState("");            // Stores any error message
    const [retryCount, setRetryCount] = useState(0);   // Used to trigger a manual refresh

    /**
     * Fetches the user's orders from the API.
     */
    const fetchOrders = useCallback(async () => {
        try {
            setError("");
            const response = await fetch(`/api/user-orders?t=${Date.now()}`, {
                cache: "no-store",
                headers: { "Pragma": "no-cache", "Cache-Control": "no-cache" }
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                // Handle banned/unauthorized users specifically
                if (response.status === 401 || response.status === 403) {
                    const msg = data.error || "Session expired or unauthorized. Please log in again.";
                    toast.error(msg);
                    setError(msg);
                    setTimeout(() => signOut({ callbackUrl: '/login' }), 2000);
                    return;
                }
                throw new Error(data.error || `Failed to fetch orders: ${response.status}`);
            }

            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setError((error as Error).message || "Failed to load orders. Please try again.");
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);

    // Connect to WebSocket for instant real-time updates on status changes
    useOrderSocket({
        subscribeUserOrders: true,
        onOrderStatusUpdate: useCallback((data: { orderId: string; status: string; payload?: Record<string, unknown> }) => {
            const altId = (data.payload?.razorpayOrderId as string) || "";
            if (data.status) {
                setOrders(prev => prev.map(order =>
                    (order._id === data.orderId || order.razorpayOrderId === data.orderId || (altId && (order._id === altId || order.razorpayOrderId === altId)))
                        ? { ...order, status: data.status as OrderStatus }
                        : order
                ));
            }
            fetchOrders();
        }, [fetchOrders]),
    });

    /**
     * Initial Load & Auth handling
     * Fetches orders once on load. Real-time updates handled via WebSocket.
     */
    useEffect(() => {
        if (status === "authenticated") {
            fetchOrders();
        } else if (status === "unauthenticated") {
            setLoading(false);
            router.push("/login"); // Send guest users to login page
        }
    }, [status, router, fetchOrders, retryCount]);

    /**
     * Called when the user clicks a "Retry" button.
     */
    const handleRetry = useCallback(() => {
        setRetryCount(prev => prev + 1);
    }, []);

    /**
     * Sorts orders so the most recent ones are at the top.
     */
    const sortedOrders = useMemo(() => {
        return [...orders].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }, [orders]);

    return {
        orders: sortedOrders,
        loading,
        error,
        handleRetry,
        fetchOrders
    };
}

