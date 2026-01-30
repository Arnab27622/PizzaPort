/**
 * This custom hook checks if the currently logged-in user is an Administrator.
 * It's used to protect admin-only pages and show/hide admin buttons.
 */

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { ExtendedUser } from "@/types/user";

/**
 * useIsAdmin Hook
 * Returns whether the current user is an admin and if the check is still loading.
 */
export function useIsAdmin() {
    const { data: session, status } = useSession(); // Get login info from NextAuth
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 1. If NextAuth is still loading the session, we are still loading
        if (status === "loading") {
            setIsLoading(true);
            return;
        }

        // 2. If the user is logged in, check their "admin" flag
        if (status === "authenticated" && session?.user) {
            const user = session.user as ExtendedUser;
            setIsAdmin(!!user.admin); // Set to true if user.admin is true
            setIsLoading(false);
        } else {
            // 3. If not logged in, they are definitely not an admin
            setIsAdmin(false);
            setIsLoading(false);
        }
    }, [status, session]);

    return { isAdmin, isLoading };
}

