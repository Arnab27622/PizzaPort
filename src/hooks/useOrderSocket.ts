"use client";

import { useEffect, useRef, useState } from "react";

interface UseOrderSocketOptions {
    orderId?: string;
    isAdmin?: boolean;
    subscribeUserOrders?: boolean;
    onOrderStatusUpdate?: (data: { orderId: string; status: string; payload?: Record<string, unknown> }) => void;
    onNewOrder?: (data: { order: Record<string, unknown> }) => void;
}

export function useOrderSocket({
    orderId,
    isAdmin = false,
    subscribeUserOrders = false,
    onOrderStatusUpdate,
    onNewOrder,
}: UseOrderSocketOptions = {}) {
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Keep handlers updated in refs to avoid socket reconnect loops
    const onStatusRef = useRef(onOrderStatusUpdate);
    const onNewOrderRef = useRef(onNewOrder);

    useEffect(() => {
        onStatusRef.current = onOrderStatusUpdate;
        onNewOrderRef.current = onNewOrder;
    }, [onOrderStatusUpdate, onNewOrder]);

    useEffect(() => {
        let isMounted = true;

        const connect = () => {
            if (wsRef.current?.readyState === WebSocket.OPEN) return;

            const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
            const host = window.location.hostname;
            const wsUrl = `${protocol}//${host}:3001`;

            try {
                const ws = new WebSocket(wsUrl);
                wsRef.current = ws;

                ws.onopen = () => {
                    if (!isMounted) return;
                    setIsConnected(true);

                    // Subscribe to specific channels
                    if (orderId) {
                        ws.send(JSON.stringify({ type: "subscribe", orderId }));
                    }
                    if (isAdmin) {
                        ws.send(JSON.stringify({ type: "subscribe_admin" }));
                    }
                    if (subscribeUserOrders || (!orderId && !isAdmin)) {
                        ws.send(JSON.stringify({ type: "subscribe_user_orders" }));
                    }
                };

                ws.onmessage = (event) => {
                    if (!isMounted) return;
                    try {
                        const data = JSON.parse(event.data);
                        if (data.type === "ORDER_STATUS_UPDATE" && onStatusRef.current) {
                            onStatusRef.current(data);
                        } else if (data.type === "NEW_ORDER" && onNewOrderRef.current) {
                            onNewOrderRef.current(data);
                        }
                    } catch (err) {
                        console.error("[WS Client] Error parsing message:", err);
                    }
                };

                ws.onclose = () => {
                    if (!isMounted) return;
                    setIsConnected(false);
                    // Attempt reconnect after 3 seconds
                    reconnectTimeoutRef.current = setTimeout(connect, 3000);
                };

                ws.onerror = () => {
                    if (!isMounted) return;
                    setIsConnected(false);
                    ws.close();
                };
            } catch (err) {
                console.error("[WS Client] Connection failed:", err);
                if (isMounted) {
                    reconnectTimeoutRef.current = setTimeout(connect, 5000);
                }
            }
        };

        connect();

        return () => {
            isMounted = false;
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [orderId, isAdmin, subscribeUserOrders]);

    return { isConnected };
}
