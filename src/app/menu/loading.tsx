/**
 * Menu Loading Component
 * Shows a skeleton while the menu page is loading.
 */

import LoadingSpinner from "@/components/icons/LoadingSpinner";
import SectionHeader from "@/components/layout/SectionHeader";

export default function Loading() {
    return (
        <div className="max-w-7xl mt-5 mx-auto px-4 py-16 text-amber-100 min-h-[80vh]">
            <SectionHeader mainHeader="Our Menu" subHeader="" />
            <div className="flex flex-col items-center justify-center mt-32">
                <LoadingSpinner size="lg" color="text-primary" />
                <p className="mt-4 text-amber-200">Loading menu...</p>
            </div>
        </div>
    );
}
