/**
 * WebSocket Server Manager
 * Provides real-time event broadcasting for order status updates and new orders.
 * Replaces aggressive HTTP polling with instant socket notifications.
 */

import { WebSocketServer, WebSocket } from "ws";

interface ClientConnection {
    ws: WebSocket;
    subscribedOrders: Set<string>;
    isAdmin: boolean;
    isUserOrdersSubscriber: boolean;
}

const WS_PORT = parseInt(process.env.WS_PORT || "3001", 10);

declare global {
    var _wssInstance: WebSocketServer | undefined;
    var _wsClients: Set<ClientConnection> | undefined;
}

export function getWebSocketServer(): { wss: WebSocketServer | null; clients: Set<ClientConnection> } {
    if (!global._wssInstance) {
        const clients = new Set<ClientConnection>();
        global._wsClients = clients;

        try {
            const wss = new WebSocketServer({ port: WS_PORT });
            global._wssInstance = wss;

            wss.on("connection", (ws: WebSocket) => {
                const clientConn: ClientConnection = {
                    ws,
                    subscribedOrders: new Set<string>(),
                    isAdmin: false,
                    isUserOrdersSubscriber: false,
                };
                clients.add(clientConn);

                ws.on("message", (rawMessage: string) => {
                    try {
                        const data = JSON.parse(rawMessage.toString());
                        if (data.type === "subscribe" && data.orderId) {
                            clientConn.subscribedOrders.add(data.orderId);
                        } else if (data.type === "unsubscribe" && data.orderId) {
                            clientConn.subscribedOrders.delete(data.orderId);
                        } else if (data.type === "subscribe_admin") {
                            clientConn.isAdmin = true;
                        } else if (data.type === "subscribe_user_orders") {
                            clientConn.isUserOrdersSubscriber = true;
                        }
                    } catch (err) {
                        console.error("[WS] Message parsing error:", err);
                    }
                });

                ws.on("close", () => {
                    clients.delete(clientConn);
                });

                ws.on("error", (err) => {
                    console.error("[WS] Client error:", err);
                    clients.delete(clientConn);
                });
            });

            console.log(`[WS] WebSocket server running on port ${WS_PORT}`);
        } catch (err) {
            console.error("[WS] Failed to initialize WebSocket server:", err);
            return { wss: null, clients: global._wsClients || new Set() };
        }
    }

    return {
        wss: global._wssInstance || null,
        clients: global._wsClients || new Set(),
    };
}

/**
 * Ensures the WebSocket server instance is initialized on server boot.
 */
export function initWebSocketServer() {
    getWebSocketServer();
}

/**
 * Broadcast order status change to subscribed clients, user order lists, and admin dashboard
 */
export function broadcastOrderStatusUpdate(orderId: string, status: string, payload?: Record<string, unknown>) {
    try {
        const { clients } = getWebSocketServer();
        const altOrderId = (payload?.razorpayOrderId as string) || "";
        const message = JSON.stringify({
            type: "ORDER_STATUS_UPDATE",
            orderId,
            status,
            payload,
            timestamp: new Date().toISOString(),
        });

        clients.forEach((client) => {
            if (client.ws.readyState === WebSocket.OPEN) {
                if (
                    client.subscribedOrders.has(orderId) ||
                    (altOrderId && client.subscribedOrders.has(altOrderId)) ||
                    client.isAdmin ||
                    client.isUserOrdersSubscriber
                ) {
                    client.ws.send(message);
                }
            }
        });
    } catch (err) {
        console.error("[WS] Failed to broadcast order update:", err);
    }
}

/**
 * Broadcast new order event to all admin clients
 */
export function broadcastNewOrder(orderData: Record<string, unknown>) {
    try {
        const { clients } = getWebSocketServer();
        const message = JSON.stringify({
            type: "NEW_ORDER",
            order: orderData,
            timestamp: new Date().toISOString(),
        });

        clients.forEach((client) => {
            if (client.ws.readyState === WebSocket.OPEN && client.isAdmin) {
                client.ws.send(message);
            }
        });
    } catch (err) {
        console.error("[WS] Failed to broadcast new order:", err);
    }
}
