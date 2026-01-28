import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { ExtendedUser } from "@/types/user";

export function useIsAdmin() {
    const { data: session, status } = useSession();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === "loading") {
            setIsLoading(true);
            return;
        }

        if (status === "authenticated" && session?.user) {
            const user = session.user as ExtendedUser;
            setIsAdmin(!!user.admin);
            setIsLoading(false);
        } else {
            setIsAdmin(false);
            setIsLoading(false);
        }
    }, [status, session]);

    return { isAdmin, isLoading };
}
