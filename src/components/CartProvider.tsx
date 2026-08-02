"use client";

/**
 * This file manages the Shopping Cart for the entire website.
 * It remembers what items are in the cart even if you refresh the page.
 */

import {
    createContext,
    ReactNode,
    useState,
    useEffect,
    useMemo,
    useCallback,
} from "react";
import { useSession } from "next-auth/react";
import { CartProduct, CartContextType } from "@/types/cart";

/**
 * Creates a "Context" so any component (like the Header or Menu)
 * can access and update the cart.
 */
export const CartContext = createContext<CartContextType>({
    cartProducts: [],
    setCartProducts: () => { },
    addToCart: () => { },
    clearCart: () => { },
    removeCartProduct: () => { },
});

/**
 * The main component that holds the logic for the cart.
 */
export default function CartProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const [cartProducts, setCartProducts] = useState<CartProduct[]>([]);
    const [isLoaded, setIsLoaded] = useState(false); // True once we've read from LocalStorage

    /**
     * Determines where to save the cart.
     * If logged in, we use the email in the key name to keep carts separate.
     * If guest, we use a generic "guest" key.
     */
    const storageKey = useMemo(() => {
        if (status === "authenticated" && session?.user?.email) {
            return `cartProducts_${session.user.email}`;
        }
        return "cartProducts_guest";
    }, [session?.user?.email, status]);

    /**
     * Load items from local storage when storageKey changes
     */
    useEffect(() => {
        try {
            const saved = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
            if (saved) {
                setCartProducts(JSON.parse(saved));
            } else {
                setCartProducts([]);
            }
        } catch {
            console.warn("Failed to parse cart data from localStorage");
            setCartProducts([]);
        } finally {
            setIsLoaded(true);
        }
    }, [storageKey]);

    /**
     * Save cart to local storage whenever cartProducts updates (only after initial load)
     */
    useEffect(() => {
        if (isLoaded && typeof window !== 'undefined') {
            localStorage.setItem(storageKey, JSON.stringify(cartProducts));
        }
    }, [cartProducts, storageKey, isLoaded]);

    /**
     * Adds an item to the cart.
     */
    const addToCart = useCallback((
        product: CartProduct,
        size: CartProduct["size"] = null,
        extras: CartProduct["extras"] = []
    ) => {
        const cartItem: CartProduct = { ...product, size, extras };
        setCartProducts((prev) => [...prev, cartItem]);
    }, []);

    /**
     * Removes all items from the cart.
     */
    const clearCart = useCallback(() => {
        setCartProducts([]);
        localStorage.removeItem(storageKey);
    }, [storageKey]);

    /**
     * Removes a single item based on its position in the list.
     */
    const removeCartProduct = useCallback((index: number) => {
        setCartProducts((prev) => prev.filter((_, i) => i !== index));
    }, []);

    // Bundle all the data and functions together to pass down to children
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

