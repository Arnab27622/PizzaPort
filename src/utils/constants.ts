export const PAYMENT_STATUS = {
    PENDING: 'pending',
    VERIFIED: 'verified',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUND_INITIATED: 'refund_initiated',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

export const ORDER_STATUS = {
    PLACED: 'placed',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    COMPLETED: 'completed',
    CANCELED: 'canceled',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];
