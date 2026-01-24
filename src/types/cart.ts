import { CartProduct } from "@/components/AppContext";

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
    total: number;
}
