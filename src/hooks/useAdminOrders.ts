import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { Order, OrderStatus } from "@/types/order";

export function useAdminOrders(isAdmin: boolean) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set());
    const [cancelingOrders, setCancelingOrders] = useState<Set<string>>(new Set());

    const fetchOrders = useCallback(async () => {
        try {
            const response = await fetch("/api/orders");
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch orders");
            }

            const data = await response.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error(error instanceof Error ? error.message : "Error fetching orders");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAdmin) {
            fetchOrders();
            const interval = setInterval(fetchOrders, 15000);
            return () => clearInterval(interval);
        }
    }, [isAdmin, fetchOrders]);

    const updateOrderStatus = useCallback(async (
        orderId: string,
        status: OrderStatus,
        e?: React.MouseEvent | React.ChangeEvent | undefined
    ) => {
        e?.stopPropagation();

        setUpdatingOrders(prev => new Set(prev).add(orderId));

        try {
            const response = await fetch(`/api/orders/${orderId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });

            if (response.ok) {
                toast.success("Order status updated");
                setOrders(prev => prev.map(order =>
                    order._id === orderId ? { ...order, status } : order
                ));
            } else {
                throw new Error("Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Error updating status");
            fetchOrders();
        } finally {
            setUpdatingOrders(prev => {
                const newSet = new Set(prev);
                newSet.delete(orderId);
                return newSet;
            });
        }
    }, [fetchOrders]);

    const cancelOrder = useCallback(async (orderId: string, e?: React.MouseEvent) => {
        e?.stopPropagation();

        setCancelingOrders(prev => new Set(prev).add(orderId));

        try {
            const response = await fetch(`/api/orders/${orderId}/cancel`, {
                method: "PATCH",
            });

            if (response.ok) {
                toast.success("Order canceled. User will be refunded within 24 hours.");
                setOrders(prev => prev.map(order =>
                    order._id === orderId ? { ...order, status: "canceled" } : order
                ));
            } else {
                throw new Error("Failed to cancel order");
            }
        } catch (error) {
            console.error("Error canceling order:", error);
            toast.error("Error canceling order");
            fetchOrders();
        } finally {
            setCancelingOrders(prev => {
                const newSet = new Set(prev);
                newSet.delete(orderId);
                return newSet;
            });
        }
    }, [fetchOrders]);

    const sortedOrders = useMemo(() => {
        return [...orders].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }, [orders]);

    return {
        orders: sortedOrders,
        loading,
        updatingOrders,
        cancelingOrders,
        fetchOrders,
        updateOrderStatus,
        cancelOrder
    };
}
