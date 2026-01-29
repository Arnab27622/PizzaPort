import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Order } from "@/types/order";

export function useUserOrders() {
    const { status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [retryCount, setRetryCount] = useState(0);

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

    useEffect(() => {
        if (status === "authenticated") {
            fetchOrders();
            const interval = setInterval(fetchOrders, 15000);
            return () => clearInterval(interval);
        } else if (status === "unauthenticated") {
            setLoading(false);
            router.push("/login");
        }
    }, [status, router, fetchOrders, retryCount]);

    const handleRetry = useCallback(() => {
        setRetryCount(prev => prev + 1);
    }, []);

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
