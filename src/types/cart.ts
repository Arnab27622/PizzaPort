/**
 * This file defines the "Types" and "Interfaces" for anything related to the Shopping Cart.
 * Types help us ensure that we are using the correct data in our code.
 */

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { CouponValidationResponse } from './coupon';

/**
 * The simple information we need for the checkout form (just the address).
 */
export interface CartFormState {
    address: string;
}

/**
 * Represents a single product as it exists in the shopping cart.
 */
export interface CartProduct {
    _id: string;            // Unique ID of the menu item
    name: string;           // Name of the item (e.g., "Pepperoni Pizza")
    basePrice: number;      // Original price
    discountPrice?: number; // Optional sale price
    imageUrl?: string;      // Image link
    size?: { name: string; extraPrice: number } | null; // Selected size option
    extras?: { name: string; extraPrice: number }[];    // Selected extra toppings
}

/**
 * These are the functions and values available throughout the app via the Cart Context.
 * It's like a "global state" for the cart.
 */
export interface CartContextType {
    cartProducts: CartProduct[]; // The list of all items currently in the cart
    setCartProducts: React.Dispatch<React.SetStateAction<CartProduct[]>>;
    addToCart: (
        product: CartProduct,
        size?: CartProduct["size"],
        extras?: CartProduct["extras"]
    ) => void; // Function to add a new item
    clearCart: () => void; // Function to empty the cart
    removeCartProduct: (index: number) => void; // Function to remove one item by its position
}

/**
 * Used for displaying the cart. If a user adds two identical pizzas,
 * we group them together and show a "quantity".
 */
export interface GroupedCartItem {
    key: string;            // A unique key for this specific combination of item + size + extras
    item: CartProduct;      // The product details
    quantity: number;       // How many of these the user wants
    indices: number[];      // Their original positions in the flat cart array
}

/**
 * The calculated costs for the entire order.
 */
export interface CartTotals {
    subtotal: number;       // Sum of all items
    tax: number;            // Extra tax cost
    deliveryFee: number;    // Shipping cost
    couponDiscount: number; // Money saved from a coupon
    total: number;          // Final amount to pay
    appliedCouponCode?: string; // The code the user used
}

/**
 * Props for the component that shows the list of items in the cart.
 */
export interface CartItemListProps {
    groupedItems: GroupedCartItem[]; // List of items (grouped by quantity)
    onRemove: (index: number) => void; // What happens when the user clicks "remove"
}

/**
 * Props for the component that shows the price summary and "Pay" button.
 */
export interface OrderSummaryProps {
    totals: CartTotals;
    onSubmit: () => void; // Function called when "Pay" is clicked
    isProcessing: boolean; // Is the payment currently loading?
    isDisabled: boolean;  // Should the button be disabled (e.g., if cart is empty)?
}

/**
 * Props for the form where the user enters their delivery address.
 */
export interface DeliveryFormProps {
    userName: string;
    userEmail: string;
    register: UseFormRegister<{ address: string }>; // Hook for form management
    errors: FieldErrors<{ address: string }>;      // Validation errors
    onFetchLocation: () => void;                  // Click handler for "Get my location"
    isFetchingLocation: boolean;                  // Is the GPS currently working?
}

/**
 * Props for the coupon input box.
 */
export interface CouponInputProps {
    subtotal: number; // Needed to check if the coupon meets the minimum order value
    onCouponApplied: (response: CouponValidationResponse) => void; // Function called when valid
    onCouponRemoved: () => void; // Function called when removed
    appliedCode?: string; // The currently active code
    isDisabled?: boolean; // Should the input be locked?
}

/**
 * Everything needed to process a payment.
 */
export interface UseCartPaymentProps {
    cartProducts: CartProduct[];
    address: string;
    userName: string;
    userEmail: string;
    clearCart: () => void;
    couponCode?: string;
    discountAmount?: number;
}


