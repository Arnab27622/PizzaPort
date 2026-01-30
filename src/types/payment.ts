/**
 * This file defines the types for Payment processing.
 * We use Razorpay as our payment gateway to handle customer transactions.
 */

/**
 * All possible stages of a payment.
 */
export const PAYMENT_STATUS = {
    PENDING: 'pending',             // Payment just started, not finished yet
    VERIFIED: 'verified',           // Payment confirmed by our server security
    COMPLETED: 'completed',         // Payment successfully finished
    FAILED: 'failed',               // Something went wrong with the payment
    REFUND_INITIATED: 'refund_initiated', // A refund has been requested
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

/**
 * What we get back from Razorpay when we create a new order on their server.
 */
export interface RazorpayOrderResponse {
    id: string;                     // Unique payment order ID
    amount: number;                 // Total cost (in paise, so ₹100 = 10000)
    currency: string;               // Currency code (usually "INR")
    [key: string]: unknown;
}

/**
 * What Razorpay sends back to our website after a customer pays.
 */
export interface RazorpayResponse {
    razorpay_payment_id: string;   // ID for the specific payment
    razorpay_order_id: string;     // ID for the overall order
    razorpay_signature: string;    // A secret code to prove the payment is real
}

/**
 * The settings used to open the Razorpay payment window.
 */
export interface RazorpayOptions {
    key: string;            // Our unique Razorpay API key
    amount: number;         // Amount to charge
    currency: string;
    name: string;           // Title shown in the payment window (e.g., "PizzaPort")
    description: string;    // Subtitle (e.g., "Pizza Delivery Order")
    order_id: string;       // The order ID we created earlier
    handler: (response: RazorpayResponse) => void; // What happens when payment is done
    prefill: {
        name: string;       // User's name (pre-filled in form)
        email: string;      // User's email (pre-filled in form)
    };
    theme: { color: string }; // Custom color for the payment window
}

/**
 * Details of an error if the payment fails.
 */
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

/**
 * This tells TypeScript that "Razorpay" is a thing that exists on the global "window" object.
 */
declare global {
    interface Window {
        Razorpay: new (opts: RazorpayOptions) => {
            open(): void;
            on(event: string, callback: (response: RazorpayError) => void): void;
            close(): void;
        };
    }
}

