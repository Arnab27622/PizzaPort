/**
 * This is the public Menu Page for customers.
 * 
 * It shows all the delicious food items available for order.
 * Features:
 * - Search bar to find items by name (e.g., "Pepperoni").
 * - Filter buttons for specific categories (e.g., "Beverages").
 * - Clicking an item opens a popup to see its picture.
 */

"use client";

import React, { useState, useCallback, useEffect } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import MenuItemCard from "@/components/layout/MenuItemCard";
import SectionHeader from "@/components/layout/SectionHeader";
import LoadingSpinner from "@/components/icons/LoadingSpinner";
import MenuSearch from "@/components/menu/MenuSearch";
import CategoryFilters from "@/components/menu/CategoryFilters";
import SharedImageModal from "@/components/common/SharedImageModal";
import { useMenuFiltering } from "@/hooks/useMenuFiltering";
import { MenuItem } from "@/types/menu";

const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch menu items");
    return res.json();
});

export default function UserMenuPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push('/login');
        }
    }, [status, router]);

    const { data: items = [], isLoading, error } = useSWR<MenuItem[]>(
        session ? "/api/menuitem" : null,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 30000, // Don't make duplicate requests within 30 seconds
            keepPreviousData: true, // Keep showing old data while fetching new data
            onError: (err) => console.error("Menu fetch error:", err)
        }
    );

    const {
        search,
        activeCategory,
        categories,
        filteredItems,
        handleSearchChange,
        handleCategoryChange,
        resetFilters
    } = useMenuFiltering(items);

    const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);

    const handleImageClick = useCallback((imageUrl: string | null) => {
        setFullImageUrl(imageUrl);
    }, []);

    const handleCloseModal = useCallback(() => {
        setFullImageUrl(null);
    }, []);

    const createImageClickHandler = useCallback((imageUrl: string | null) => {
        return () => handleImageClick(imageUrl);
    }, [handleImageClick]);

    if (status === "loading") {
        return (
            <div className="max-w-7xl mt-5 mx-auto px-4 py-16 text-amber-100 min-h-[80vh]">
                <SectionHeader mainHeader="Our Menu" subHeader="" />
                <div className="flex flex-col items-center justify-center mt-32">
                    <LoadingSpinner size="lg" color="text-primary" />
                    <p className="mt-4 text-amber-200">Checking authentication...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="max-w-7xl mt-5 mx-auto px-4 py-16 text-amber-100 min-h-[80vh]">
                <SectionHeader mainHeader="Our Menu" subHeader="" />
                <div className="flex flex-col items-center justify-center mt-32">
                    <LoadingSpinner size="lg" color="text-primary" />
                    <p className="mt-4 text-amber-200">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
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

    if (error) {
        return (
            <div className="max-w-7xl mt-5 mx-auto px-4 py-16 text-amber-100 min-h-[80vh]">
                <SectionHeader mainHeader="Our Menu" subHeader="" />
                <div className="max-w-xl mx-auto p-6 text-center">
                    <div className="bg-red-900/30 border border-red-800 rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-red-300 mb-2">Failed to Load Menu</h3>
                        <p className="text-amber-200">We&apos;re having trouble loading our menu. Please try again later.</p>
                        <button
                            className="mt-4 px-4 py-2 bg-primary rounded-lg hover:bg-amber-600 transition-colors cursor-pointer"
                            onClick={() => window.location.reload()}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mt-5 mx-auto px-4 py-16 text-amber-100 min-h-[80vh]">
            <SectionHeader mainHeader="Our Menu" subHeader="" />

            <MenuSearch value={search} onChange={handleSearchChange} />

            <CategoryFilters
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
            />

            {filteredItems.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredItems.map((item) => (
                        <MenuItemCard
                            key={item._id}
                            item={item}
                            onImageClick={createImageClickHandler(item.imageUrl || null)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="text-amber-300 text-xl mb-2">No items found</div>
                    <p className="text-amber-500">
                        {search || activeCategory
                            ? "Try adjusting your search or filter criteria"
                            : "Our menu is currently empty"}
                    </p>
                    {(search || activeCategory) && (
                        <button
                            onClick={resetFilters}
                            className="mt-4 px-4 py-2 bg-primary rounded-lg hover:bg-amber-600 transition-colors cursor-pointer"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            )}

            <SharedImageModal imageUrl={fullImageUrl} onClose={handleCloseModal} />
        </div>
    );
}
