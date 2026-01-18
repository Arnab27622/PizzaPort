import { useSession } from "next-auth/react";

/**
 * Custom React Hook: useIsAdmin
 * 
 * Provides authentication and authorization state for admin users
 * 
 * This hook checks the current user's session and determines if they have
 * administrator privileges. It's used throughout the application to
 * conditionally render admin-only features and protect admin routes.
 * 
 * @returns {Object} Authentication state object containing:
 *   - isAdmin: boolean - True if user has admin privileges
 *   - isLoading: boolean - True while authentication status is being determined
 * 
 * @example
 * // Basic usage in a component
 * const { isAdmin, isLoading } = useIsAdmin();
 * 
 * if (isLoading) return <LoadingSpinner />;
 * if (!isAdmin) return <UnauthorizedMessage />;
 * 
 * return <AdminDashboard />;
 * 
 * @example
 * // Conditional rendering
 * const { isAdmin } = useIsAdmin();
 * 
 * return (
 *   <div>
 *     {isAdmin && <AdminControls />}
 *     <PublicContent />
 *   </div>
 * );
 * 
 * @security
 * - Requires authenticated session (redirects to login if not authenticated)
 * - Relies on NextAuth session management
 * - Checks admin flag from user session data
 * 
 * @dependencies
 * - NextAuth React client session hook
 * - NextAuth session configuration with admin field
 * 
 * @performance
 * - Uses NextAuth's built-in session caching
 * - Minimal re-renders through efficient session state management
 */
export function useIsAdmin(): { isAdmin: boolean; isLoading: boolean } {
    /**
     * Session Management
     * 
     * Uses NextAuth's useSession hook with required authentication
     * Automatically redirects to login page if no active session exists
     * Provides real-time session state updates
     */
    const { data: session, status } = useSession({ required: true });

    /**
     * Loading State Determination
     * 
     * Indicates whether the authentication status is still being verified
     * Useful for showing loading indicators while checking permissions
     */
    const isLoading = status === "loading";

    /**
     * Admin Privilege Check
     * 
     * Verifies if the authenticated user has administrator privileges
     * Checks the admin boolean flag from the user session object
     * Returns false for non-admin users and during loading states
     */
    const isAdmin = session?.user?.admin === true;

    /**
     * Return Authentication State
     * 
     * Provides both admin status and loading state for component consumption
     * Enables conditional rendering and route protection patterns
     */
    return { isAdmin, isLoading };
}