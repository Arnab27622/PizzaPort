import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { CouponValidationResponse } from './coupon';

export interface CartFormState {
    address: string;
}

export interface CartProduct {
    _id: string;
    name: string;
    basePrice: number;
    discountPrice?: number;
    imageUrl?: string;
    size?: { name: string; extraPrice: number } | null;
    extras?: { name: string; extraPrice: number }[];
}

export interface CartContextType {
    cartProducts: CartProduct[];
    setCartProducts: React.Dispatch<React.SetStateAction<CartProduct[]>>;
    addToCart: (
        product: CartProduct,
        size?: CartProduct["size"],
        extras?: CartProduct["extras"]
    ) => void;
    clearCart: () => void;
    removeCartProduct: (index: number) => void;
}

export interface GroupedCartItem {
    key: string;
    item: CartProduct;
    quantity: number;
    indices: number[];
}

export interface CartTotals {
    subtotal: number;
    tax: number;
    deliveryFee: number;
    couponDiscount: number;
    total: number;
    appliedCouponCode?: string;
}

export interface CartItemListProps {
    groupedItems: GroupedCartItem[];
    onRemove: (index: number) => void;
}

export interface OrderSummaryProps {
    totals: CartTotals;
    onSubmit: () => void;
    isProcessing: boolean;
    isDisabled: boolean;
}

export interface DeliveryFormProps {
    userName: string;
    userEmail: string;
    register: UseFormRegister<{ address: string }>;
    errors: FieldErrors<{ address: string }>;
    onFetchLocation: () => void;
    isFetchingLocation: boolean;
}

export interface CouponInputProps {
    subtotal: number;
    onCouponApplied: (response: CouponValidationResponse) => void;
    onCouponRemoved: () => void;
    appliedCode?: string;
    isDisabled?: boolean;
}

export interface UseCartPaymentProps {
    cartProducts: CartProduct[];
    address: string;
    userName: string;
    userEmail: string;
    clearCart: () => void;
    couponCode?: string;
    discountAmount?: number;
}

