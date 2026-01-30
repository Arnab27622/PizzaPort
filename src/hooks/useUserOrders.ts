/**
 * This custom hook manages the list of all orders placed by the current User.
 * It shows their order history and updates automatically if something changes.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Order } from "@/types/order";

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
            const response = await fetch("/api/user-orders");

            if (!response.ok) {
                throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setError("Failed to load orders. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Automatic Refresh: Every 15 seconds, check for updates.
     * Also redirects to login if the user isn't logged in.
     */
    useEffect(() => {
        if (status === "authenticated") {
            fetchOrders();
            const interval = setInterval(fetchOrders, 15000); // 15 seconds
            return () => clearInterval(interval);
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

