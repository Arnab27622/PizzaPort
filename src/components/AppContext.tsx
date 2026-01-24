"use client";

import { SessionProvider, useSession } from "next-auth/react";
import React, {
    createContext,
    ReactNode,
    useState,
    Dispatch,
    SetStateAction,
    useEffect,
    useMemo,
    useCallback,
} from "react";

/**
 * Interface representing a product in the shopping cart
 */
export interface CartProduct {
    _id: string;
    name: string;
    basePrice: number;
    imageUrl?: string;
    size?: { name: string; extraPrice: number } | null;
    extras?: { name: string; extraPrice: number }[];
}

/**
 * Interface defining the shape of the cart context
 */
export interface CartContextType {
    cartProducts: CartProduct[];
    setCartProducts: Dispatch<SetStateAction<CartProduct[]>>;
    addToCart: (
        product: CartProduct,
        size?: CartProduct["size"],
        extras?: CartProduct["extras"]
    ) => void;
    clearCart: () => void;
    removeCartProduct: (index: number) => void;
}

/**
 * Cart context for managing shopping cart state across the application
 */
export const CartContext = createContext<CartContextType>({
    cartProducts: [],
    setCartProducts: () => { },
    addToCart: () => { },
    clearCart: () => { },
    removeCartProduct: () => { },
});

/**
 * Cart provider component that handles cart persistence tied to the user session
 */
function CartProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const [cartProducts, setCartProducts] = useState<CartProduct[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    /**
     * Determine the localStorage key based on user email or guest status
     */
    const storageKey = useMemo(() => {
        if (status === "authenticated" && session?.user?.email) {
            return `cartProducts_${session.user.email}`;
        }
        return "cartProducts_guest";
    }, [session?.user?.email, status]);

    /**
     * Load cart products from localStorage whenever the storageKey changes
     */
    useEffect(() => {
        setIsLoaded(false);
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                setCartProducts(JSON.parse(saved));
            } catch {
                console.warn("Failed to parse cart data from localStorage");
                setCartProducts([]);
            }
        } else {
            setCartProducts([]);
        }
        setIsLoaded(true);
    }, [storageKey]);

    /**
     * Persist cart products to localStorage whenever they change
     */
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(storageKey, JSON.stringify(cartProducts));
        }
    }, [cartProducts, storageKey, isLoaded]);

    const addToCart = useCallback((
        product: CartProduct,
        size: CartProduct["size"] = null,
        extras: CartProduct["extras"] = []
    ) => {
        const cartItem: CartProduct = { ...product, size, extras };
        setCartProducts((prev) => [...prev, cartItem]);
    }, []);

    const clearCart = useCallback(() => {
        setCartProducts([]);
        localStorage.removeItem(storageKey);
    }, [storageKey]);

    const removeCartProduct = useCallback((index: number) => {
        setCartProducts((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const contextValue = useMemo(() => ({
        cartProducts,
        setCartProducts,
        addToCart,
        clearCart,
        removeCartProduct
    }), [cartProducts, addToCart, clearCart, removeCartProduct]);

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
}

/**
 * Main application context provider component
 */
export default function AppContext({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <CartProvider>
                {children}
            </CartProvider>
        </SessionProvider>
    );
}