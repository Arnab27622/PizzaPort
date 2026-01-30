"use client";

/**
 * This component handles the User's Login Session.
 * It wraps the app in a "SessionProvider", which allows any page
 * to quickly check if the user is logged in or not.
 */

import { SessionProvider } from "next-auth/react";
import React, { ReactNode } from "react";

export default function AuthProvider({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    );
}
