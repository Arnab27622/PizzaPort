/**
 * Cart Loading Component
 * Shows a skeleton while the cart page is loading.
 */

import LoadingSpinner from "@/components/icons/LoadingSpinner";

export default function Loading() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-16 min-h-[80vh] flex items-center justify-center">
            <div className="text-center">
                <LoadingSpinner size="lg" color="text-primary" />
                <p className="mt-4 text-amber-200">Loading cart...</p>
            </div>
        </div>
    );
}
