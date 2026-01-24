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
