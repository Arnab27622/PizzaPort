export const PAYMENT_STATUS = {
    PENDING: 'pending',
    VERIFIED: 'verified',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUND_INITIATED: 'refund_initiated',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

/**
 * Razorpay Order Response Interface
 * Defines the structure of the response from Razorpay order creation API
 */
export interface RazorpayOrderResponse {
    id: string;                     // Razorpay order ID
    amount: number;                 // Order amount in smallest currency unit (paise for INR)
    currency: string;               // Currency code (e.g., "INR")
    [key: string]: unknown;         // Allow for additional Razorpay response fields
}

export interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

export interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: RazorpayResponse) => void;
    prefill: {
        name: string;
        email: string;
    };
    theme: { color: string };
}

export interface RazorpayError {
    error: {
        code: string;
        description: string;
        source: string;
        step: string;
        reason: string;
        metadata: unknown;
    };
}

declare global {
    interface Window {
        Razorpay: new (opts: RazorpayOptions) => {
            open(): void;
            on(event: string, callback: (response: RazorpayError) => void): void;
            close(): void;
        };
    }
}
