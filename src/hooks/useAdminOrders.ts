/**
 * This custom hook manages the list of orders for the Administrator.
 * It allows the admin to view all orders, change their status, and cancel them.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { Order, OrderStatus } from "@/types/order";

/**
 * useAdminOrders Hook
 * Only fetches order data if the user is an admin.
 */
export function useAdminOrders(isAdmin: boolean) {
    const [orders, setOrders] = useState<Order[]>([]); // List of all orders
    const [loading, setLoading] = useState(true);      // True when first loading the list
    const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set()); // IDs of orders currently being updated
    const [cancelingOrders, setCancelingOrders] = useState<Set<string>>(new Set()); // IDs of orders currently being canceled

    /**
     * Fetches the latest orders from the database.
     */
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

    /**
     * Set up an automatic refresh.
     * Every 15 seconds, the list will update so the admin sees new orders immediately.
     */
    useEffect(() => {
        if (isAdmin) {
            fetchOrders();
            const interval = setInterval(fetchOrders, 15000); // 15 seconds
            return () => clearInterval(interval); // Stop refreshing when the user leaves the page
        }
    }, [isAdmin, fetchOrders]);

    /**
     * Updates the status of an order (e.g., from "Placed" to "Preparing").
     */
    const updateOrderStatus = useCallback(async (
        orderId: string,
        status: OrderStatus,
        e?: React.MouseEvent | React.ChangeEvent | undefined
    ) => {
        e?.stopPropagation(); // Prevent clicking the card from opening the details page

        // Mark this order as "currently updating" (to show a spinner)
        setUpdatingOrders(prev => new Set(prev).add(orderId));

        try {
            const response = await fetch(`/api/orders/${orderId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });

            if (response.ok) {
                toast.success("Order status updated");
                // Update the local list so the change appears instantly
                setOrders(prev => prev.map(order =>
                    order._id === orderId ? { ...order, status } : order
                ));
            } else {
                throw new Error("Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Error updating status");
            fetchOrders(); // Refresh the list if something went wrong
        } finally {
            // Remove the "updating" mark
            setUpdatingOrders(prev => {
                const newSet = new Set(prev);
                newSet.delete(orderId);
                return newSet;
            });
        }
    }, [fetchOrders]);

    /**
     * Cancels an order and triggers a refund.
     */
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

    /**
     * Sort orders so that the newest ones appear at the top.
     */
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

