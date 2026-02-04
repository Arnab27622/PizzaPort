/**
 * Root Loading Component
 * Shows a minimal loading skeleton while the page is being loaded.
 * This improves perceived performance by showing something immediately.
 */

import LoadingSpinner from "@/components/icons/LoadingSpinner";

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <LoadingSpinner size="lg" color="text-primary" />
                <p className="mt-4 text-amber-200 animate-pulse">Loading...</p>
            </div>
        </div>
    );
}
