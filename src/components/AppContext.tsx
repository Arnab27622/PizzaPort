"use client";

/**
 * AppContext is like the "Main Container" for our entire website.
 * It wraps the whole application so that things like "Shopping Cart" 
 * and "User Login" work on every single page.
 */

import React, { ReactNode } from "react";
import AuthProvider from "./AuthProvider";
import CartProvider from "./CartProvider";

export default function AppContext({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <CartProvider>
                {children}
            </CartProvider>
        </AuthProvider>
    );
}
