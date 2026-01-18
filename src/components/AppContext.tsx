"use client";

import { SessionProvider } from "next-auth/react";
import React, {
    createContext,
    ReactNode,
    useState,
    Dispatch,
    SetStateAction,
    useEffect,
} from "react";

/**
 * Interface representing a product in the shopping cart
 * @interface CartProduct
 * @property {string} _id - Unique identifier for the product
 * @property {string} name - Display name of the product
 * @property {number} basePrice - Base price without any customizations
 * @property {string} [imageUrl] - Optional URL for the product image
 * @property {Object} [size] - Optional selected size with name and extra price
 * @property {string} size.name - Name of the selected size
 * @property {number} size.extraPrice - Additional cost for this size
 * @property {Array} [extras] - Optional array of extra ingredients/toppings
 * @property {string} extras.name - Name of the extra ingredient
 * @property {number} extras.extraPrice - Additional cost for this extra
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
 * @interface CartContextType
 * @property {CartProduct[]} cartProducts - Array of products currently in the cart
 * @property {Dispatch<SetStateAction<CartProduct[]>>} setCartProducts - Function to update cart products
 * @property {Function} addToCart - Function to add a product to the cart
 * @property {Function} clearCart - Function to remove all products from the cart
 * @property {Function} removeCartProduct - Function to remove a specific product by index
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
 * @constant {React.Context<CartContextType>}
 * 
 * @description
 * - Provides cart state management to all child components
 * - Includes default empty implementations to avoid runtime errors
 * - Used with useContext hook in components that need cart access
 */
export const CartContext = createContext<CartContextType>({
    cartProducts: [],
    setCartProducts: () => { },
    addToCart: () => { },
    clearCart: () => { },
    removeCartProduct: () => { },
});

/**
 * Props for the AppContext provider component
 * @interface AppContextProps
 * @property {ReactNode} children - Child components to be wrapped by the context providers
 */
interface AppContextProps {
    children: ReactNode;
}

/**
 * Main application context provider component
 * 
 * @component
 * @description 
 * - Wraps the entire application with SessionProvider and CartContext
 * - Manages global cart state with localStorage persistence
 * - Provides cart operations: add, remove, clear
 * - Synchronizes cart state with browser localStorage
 * - Handles NextAuth session management
 * 
 * @param {AppContextProps} props - Component properties
 * @param {ReactNode} props.children - Child components to be wrapped
 * 
 * @example
 * <AppContext>
 *   <App />
 * </AppContext>
 * 
 * @returns {JSX.Element} Context providers wrapping the application
 */
export default function AppContext({ children }: AppContextProps) {
    /**
     * State for managing cart products
     * @state {CartProduct[]} cartProducts - Array of products in the cart
     */
    const [cartProducts, setCartProducts] = useState<CartProduct[]>([]);

    /**
     * Effect hook for loading cart data from localStorage on component mount
     * @effect
     * @listens componentDidMount
     * 
     * @description
     * - Attempts to load saved cart from localStorage
     * - Handles JSON parse errors gracefully
     * - Only runs once on initial component mount
     */
    useEffect(() => {
        const saved = localStorage.getItem("cartProducts");
        if (saved) {
            try {
                setCartProducts(JSON.parse(saved));
            } catch {
                // Ignore parse errors and use empty cart as fallback
                console.warn("Failed to parse cart data from localStorage");
            }
        }
    }, []);

    /**
     * Effect hook for persisting cart changes to localStorage
     * @effect
     * @listens cartProducts
     * 
     * @description
     * - Automatically saves cart to localStorage whenever cartProducts changes
     * - Ensures cart state persists across browser sessions
     * - Runs on every cartProducts state change
     */
    useEffect(() => {
        localStorage.setItem("cartProducts", JSON.stringify(cartProducts));
    }, [cartProducts]);

    /**
     * Adds a product to the shopping cart
     * @function addToCart
     * @param {CartProduct} product - The product to add to cart
     * @param {CartProduct["size"]} [size=null] - Optional selected size
     * @param {CartProduct["extras"]} [extras=[]] - Optional array of extras
     * @returns {void}
     * 
     * @description
     * - Creates a new cart item with product details and customizations
     * - Appends the item to the current cart products array
     * - Automatically triggers localStorage sync via useEffect
     */
    const addToCart = (
        product: CartProduct,
        size: CartProduct["size"] = null,
        extras: CartProduct["extras"] = []
    ) => {
        const cartItem: CartProduct = { ...product, size, extras };
        setCartProducts((prev) => [...prev, cartItem]);
    };

    /**
     * Removes all products from the shopping cart
     * @function clearCart
     * @returns {void}
     * 
     * @description
     * - Resets cart products to empty array
     * - Removes cart data from localStorage
     * - Typically used after successful order placement
     */
    const clearCart = () => {
        setCartProducts([]);
        localStorage.removeItem("cartProducts");
    };

    /**
     * Removes a specific product from the cart by index
     * @function removeCartProduct
     * @param {number} index - The index of the product to remove
     * @returns {void}
     * 
     * @description
     * - Filters out the product at the specified index
     * - Maintains the order of remaining products
     * - Automatically triggers localStorage sync via useEffect
     */
    const removeCartProduct = (index: number) => {
        setCartProducts((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        // NextAuth session provider for authentication state management
        <SessionProvider>
            {/* Cart context provider for global cart state management */}
            <CartContext.Provider value={{
                cartProducts,
                setCartProducts,
                addToCart,
                clearCart,
                removeCartProduct
            }}>
                {children}
            </CartContext.Provider>
        </SessionProvider>
    );
}