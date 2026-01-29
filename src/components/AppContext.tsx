"use client";

import React, { ReactNode } from "react";
import AuthProvider from "./AuthProvider";
import CartProvider from "./CartProvider";

/**
 * Main application context provider component
 * Composes independent providers for authentication and shopping cart
 */
export default function AppContext({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <CartProvider>
                {children}
            </CartProvider>
        </AuthProvider>
    );
}