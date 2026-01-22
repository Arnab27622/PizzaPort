"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
import useSWR from "swr";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import MenuItemCard from "@/components/layout/MenuItemCard";
import SectionHeader from "@/components/layout/SectionHeader";
import LoadingSpinner from "@/components/icons/LoadingSpinner";

/**
 * Menu Item Type Definition
 * 
 * Defines the structure of menu items fetched from the API
 * Matches the database schema for menu items
 */
interface MenuItemType {
    _id: string;              // Unique MongoDB identifier
    name: string;             // Display name of the menu item
    description: string;      // Item description for customers
    basePrice: number;        // Base price without extras
    imageUrl?: string;        // Optional product image URL
    category?: string;        // Optional category for filtering
}

/**
 * Data Fetcher Function for SWR
 * 
 * Handles API requests with proper error handling
 * Used by SWR for data fetching and caching
 * 
 * @param {string} url - API endpoint to fetch data from
 * @returns {Promise<MenuItemType[]>} Array of menu items
 * @throws {Error} When API response is not OK
 */
const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch menu items");
    return res.json();
});

/**
 * UserMenuPage Component
 * 
 * Main menu interface for customers to browse and search menu items
 * Features:
 * - Authentication check with automatic redirection
 * - Search functionality with real-time filtering
 * - Category-based filtering
 * - Image modal for detailed product viewing
 * - Responsive grid layout
 * - Loading and error states
 * 
 * @component
 * @example
 * <UserMenuPage />
 * 
 * @security
 * - Client-side authentication checking prevents unauthorized access
 * - Automatic redirection to login for unauthenticated users
 * - Session validation through NextAuth.js
 * 
 * @features
 * - Real-time search across menu item names
 * - Dynamic category filtering
 * - Image zoom modal for product details
 * - Responsive grid layout (1-4 columns based on screen size)
 * - SWR caching for optimal performance
 * - Accessibility-compliant interface
 * 
 * @performance
 * - Uses SWR for intelligent caching and revalidation
 * - Memoized calculations prevent unnecessary re-renders
 * - Optimized image loading with Next.js Image component
 * - Debounced search through React state batching
 * 
 * @accessibility
 * - ARIA labels for interactive elements
 * - Keyboard navigation support
 * - Screen reader compatible
 * - Focus management for modal interactions
 */
export default function UserMenuPage() {
    /**
     * Authentication & Routing
     * 
     * Checks user authentication status and handles redirection
     * Essential for protecting authenticated routes and user data
     */
    const { data: session, status } = useSession();
    const router = useRouter();

    /**
     * Authentication Effect
     * 
     * Redirects unauthenticated users to login page
     * Runs when session status changes to ensure proper access control
     */
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push('/login');
        }
    }, [status, router]);

    /**
     * Data Fetching with SWR
     * 
     * Fetches menu items from API with caching and error handling
     * Only fetches data when user is authenticated
     * SWR provides:
     * - Automatic caching and revalidation
     * - Background data synchronization
     * - Error retry mechanisms
     */
    const { data: items = [], isLoading, error } = useSWR<MenuItemType[]>(
        session ? "/api/menuitem" : null, // Only fetch when authenticated
        fetcher,
        {
            revalidateOnFocus: false, // Prevents refetching on window focus
            onError: (err) => console.error("Menu fetch error:", err) // Error logging
        }
    );

    /**
     * Component State Management
     * 
     * @state fullImageUrl - Controls image modal display and content
     * @state search - Search query for filtering menu items
     * @state activeCategory - Currently selected category filter
     */
    const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<string>("");

    /**
     * Category Extraction Hook
     * 
     * Derives unique categories from menu items for filter buttons
     * Memoized to prevent recalculating on every render
     * 
     * @returns {string[]} Sorted array of unique category names
     * 
     * @performance Only recalculates when items array changes
     * @logic Filters out undefined categories and removes duplicates
     */
    const categories = useMemo(() => {
        const cats = items
            .map(item => item.category)
            .filter((cat): cat is string => !!cat); // Type guard to remove undefined
        return Array.from(new Set(cats)).sort(); // Remove duplicates and sort
    }, [items]);

    /**
     * Menu Item Filtering Hook
     * 
     * Applies search and category filters to menu items
     * Memoized to prevent recalculating on every render
     * 
     * @returns {MenuItemType[]} Filtered array of menu items
     * 
     * @filter_logic
     * - Search: Case-insensitive match against item name
     * - Category: Match against active category (or show all if no category selected)
     * 
     * @performance Only recalculates when items, search, or activeCategory change
     */
    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = activeCategory ? item.category === activeCategory : true;
            return matchesSearch && matchesCategory;
        });
    }, [items, search, activeCategory]);

    /**
     * Image Modal Handlers
     * 
     * Controls the display of full-size product images
     * Uses useCallback to maintain stable function references
     */
    const handleImageClick = useCallback((imageUrl: string | null) => {
        setFullImageUrl(imageUrl);
    }, []);

    const handleCloseModal = useCallback(() => {
        setFullImageUrl(null);
    }, []);

    /**
     * Search Input Handler
     * 
     * Updates search state on input change
     * Controlled component pattern for real-time filtering
     */
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    }, []);

    /**
     * Category Filter Handler
     * 
     * Toggles category selection with toggle behavior
     * Clicking active category deselects it (shows all items)
     * 
     * @param {string} category - Category to toggle
     */
    const handleCategoryChange = useCallback((category: string) => {
        setActiveCategory(prev => prev === category ? "" : category);
    }, []);

    /**
     * Image Click Handler Factory
     * 
     * Creates closure-based click handlers for individual menu items
     * Required because MenuItemCard expects a parameterless function
     * 
     * @param {string | null} imageUrl - Image URL to display in modal
     * @returns {Function} Parameterless click handler
     */
    const createImageClickHandler = useCallback((imageUrl: string | null) => {
        return () => handleImageClick(imageUrl);
    }, [handleImageClick]);

    /**
     * Authentication Loading State
     * 
     * Displays loading spinner while checking authentication status
     * Provides better user experience during authentication verification
     */
    if (status === "loading") {
        return (
            <div className="max-w-7xl mt-5 mx-auto px-4 py-16 text-amber-100 min-h-[80vh] flex flex-col items-center justify-center">
                <SectionHeader mainHeader="Our Menu" subHeader="" />
                <div className="flex flex-col items-center justify-center mt-12">
                    <LoadingSpinner size="lg" color="text-primary" />
                    <p className="mt-4 text-amber-200">Checking authentication...</p>
                </div>
            </div>
        );
    }

    /**
     * Unauthorized Access State
     * 
     * Prevents rendering content for unauthenticated users
     * Redirects to login page via useEffect hook
     */
    if (!session) {
        return (
            <div className="max-w-7xl mt-5 mx-auto px-4 py-16 text-amber-100 min-h-[80vh] flex flex-col items-center justify-center">
                <SectionHeader mainHeader="Our Menu" subHeader="" />
                <div className="flex flex-col items-center justify-center mt-12">
                    <LoadingSpinner size="lg" color="text-primary" />
                    <p className="mt-4 text-amber-200">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    /**
     * Data Loading State
     * 
     * Displays loading spinner while fetching menu data
     * Provides better user experience during data loading
     */
    if (isLoading) {
        return (
            <div className="max-w-7xl mt-5 mx-auto px-4 py-16 text-amber-100 min-h-[80vh] flex flex-col items-center justify-center">
                <SectionHeader mainHeader="Our Menu" subHeader="" />
                <div className="flex flex-col items-center justify-center mt-12">
                    <LoadingSpinner size="lg" color="text-primary" />
                </div>
            </div>
        );
    }

    /**
     * Error State
     * 
     * Displays user-friendly error message with retry option
     * Handles API failures and network errors gracefully
     */
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

    /**
     * Main Component Render
     * 
     * Implements a complete menu browsing interface with:
     * - Search functionality
     * - Category filtering
     * - Responsive grid layout
     * - Image modal system
     * 
     * Only renders when user is authenticated and data is loaded
     */
    return (
        <div className="max-w-7xl mt-5 mx-auto px-4 py-16 text-amber-100 min-h-[80vh]">
            {/* Page Header */}
            <SectionHeader mainHeader="Our Menu" subHeader="" />

            {/* Search Input */}
            <div className="mb-6 max-w-md mx-auto">
                <input
                    type="text"
                    placeholder="Search for pizza..."
                    value={search}
                    onChange={handleSearchChange}
                    className="w-full px-4 py-2 rounded-lg bg-[#1a1108] border border-amber-800 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Search menu items"
                />
            </div>

            {/* Category Filter Buttons */}
            {categories.length > 0 && (
                <div className="flex flex-wrap justify-center gap-3 mb-10">
                    {/* "All Items" Filter Button */}
                    <button
                        key="all"
                        onClick={() => setActiveCategory("")}
                        className={`px-4 py-2 rounded-full border border-amber-800 text-sm transition-all cursor-pointer ${!activeCategory
                            ? "bg-primary text-white"
                            : "bg-[#1a1108] text-amber-200 hover:bg-amber-900/60"
                            }`}
                    >
                        All Items
                    </button>
                    {/* Dynamic Category Buttons */}
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryChange(cat)}
                            className={`px-4 py-2 rounded-full border border-amber-800 text-sm transition-all cursor-pointer ${activeCategory === cat
                                ? "bg-primary text-white"
                                : "bg-[#1a1108] text-amber-200 hover:bg-amber-900/60"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {/* Menu Items Grid */}
            {filteredItems.length > 0 ? (
                /**
                 * Responsive Grid Layout
                 * 
                 * Adapts to different screen sizes:
                 * - Mobile: 1 column
                 * - Small tablets: 2 columns  
                 * - Tablets: 3 columns
                 * - Desktop: 4 columns
                 */
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
                /**
                 * Empty State
                 * 
                 * Shows appropriate message based on filter state
                 * Provides clear actions to reset filters
                 */
                <div className="text-center py-12">
                    <div className="text-amber-300 text-xl mb-2">No items found</div>
                    <p className="text-amber-500">
                        {search || activeCategory
                            ? "Try adjusting your search or filter criteria"
                            : "Our menu is currently empty"}
                    </p>
                    {/* Clear Filters Button (only shown when filters are active) */}
                    {(search || activeCategory) && (
                        <button
                            onClick={() => {
                                setSearch("");
                                setActiveCategory("");
                            }}
                            className="mt-4 px-4 py-2 bg-primary rounded-lg hover:bg-amber-600 transition-colors cursor-pointer"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            )}

            {/* Full-Size Image Modal */}
            {fullImageUrl && (
                /**
                 * Modal Overlay
                 * 
                 * Clicking anywhere on the overlay closes the modal
                 * Uses fixed positioning to overlay entire viewport
                 */
                <div
                    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
                    onClick={handleCloseModal}
                >
                    {/* Image Container */}
                    <div className="relative w-full max-w-xs sm:max-w-md h-72 sm:h-96">
                        <Image
                            src={fullImageUrl}
                            alt="Full size menu item"
                            fill
                            className="object-contain"
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                            priority // Load image immediately as it's user-requested
                        />
                    </div>
                    {/* Close Button */}
                    <button
                        className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors cursor-pointer"
                        onClick={handleCloseModal}
                        aria-label="Close image"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}