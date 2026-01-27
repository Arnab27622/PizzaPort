"use client";

import React, { useEffect, useState, useCallback } from 'react';
import SectionHeader from './SectionHeader';
import Image from 'next/image';
import MenuItemCard from './MenuItemCard';
import LoadingSpinner from '../icons/LoadingSpinner';
import Link from 'next/link';
import Right from '../icons/Right';

import { MenuItem } from '@/types/menu';


/**
 * HomeMenu component that displays the top best-selling menu items
 * 
 * @component
 * @description 
 * - Fetches top 6 best-selling menu items based on actual order data
 * - Displays items sorted by sales quantity (most popular first)
 * - Shows loading state during fetch
 * - Handles errors with retry functionality
 * - Includes modal for full-size image viewing
 * - Provides navigation to full menu page
 * 
 * @example
 * return <HomeMenu />
 * 
 * @returns {JSX.Element} Section displaying best-selling menu items
 */
function HomeMenu() {
    // State for storing fetched menu items
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    // State to track loading status
    const [loading, setLoading] = useState(true);
    // State to store any error messages
    const [error, setError] = useState<string | null>(null);
    // State to control full-size image modal
    const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);

    /**
     * Fetches the top best-selling menu items from the API
     * @function fetchMenuItems
     * @async
     * @returns {Promise<void>}
     * 
     * @description
     * - Makes API call to fetch best-selling menu items based on order data
     * - Transforms data and ensures imageUrl is properly formatted
     * - Displays top 6 best-selling items
     * - Handles errors and updates loading state
     */
    const fetchMenuItems = useCallback(async () => {
        try {
            const response = await fetch('/api/menuitem/bestsellers');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Transform data to ensure consistent structure
            const transformedData = data.map((item: Partial<MenuItem>) => ({
                ...item,
                imageUrl: item.imageUrl || undefined,
                sizeOptions: item.sizeOptions || [],
                extraIngredients: item.extraIngredients || []
            })) as MenuItem[];

            // Set state with best-selling items (already limited to 6 by API)
            setMenuItems(transformedData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load menu items');
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch menu items on component mount
    useEffect(() => {
        fetchMenuItems();
    }, [fetchMenuItems]);

    /**
     * Closes the full-size image modal
     * @function closeModal
     * @returns {void}
     */
    const closeModal = useCallback(() => {
        setFullImageUrl(null);
    }, []);

    // Loading state UI
    if (loading) {
        return (
            <section className='px-4'>
                <div className='relative max-w-6xl mx-auto'>
                    <SectionHeader subHeader="Check out" mainHeader="Our Best Sellers" />
                    <div className="max-w-xl mx-auto flex flex-col items-center justify-center h-96">
                        <LoadingSpinner size="lg" color="text-primary" className="mb-4" />
                        <p className="text-amber-300">Loading featured items...</p>
                    </div>
                </div>
            </section>
        );
    }

    // Error state UI with retry functionality
    if (error) {
        return (
            <section className='px-4'>
                <div className='relative max-w-6xl mx-auto'>
                    <SectionHeader subHeader="Check out" mainHeader="Our Best Sellers" />
                    <div className="max-w-xl mx-auto flex flex-col items-center justify-center p-4 bg-red-100 border border-red-200 rounded-lg">
                        <p className="text-red-700 font-medium mb-2">Error Loading Menu</p>
                        <p className="text-red-600 text-sm mb-4">{error}</p>
                        <button
                            onClick={fetchMenuItems}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors cursor-pointer"
                            aria-label="Retry loading menu items"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    // Main component render
    return (
        <section className='px-4 py-12'>
            <div className='relative max-w-6xl mx-auto'>
                {/* Section header with title and subtitle */}
                <SectionHeader subHeader="Check out" mainHeader="Our Best Sellers" />

                {/* Grid layout for menu items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {menuItems.map(item => (
                        <MenuItemCard
                            key={item._id}
                            item={item}
                            onImageClick={() => item.imageUrl && setFullImageUrl(item.imageUrl)}
                        />
                    ))}
                </div>

                {/* Navigation to full menu page */}
                <div className="mt-10 flex justify-center">
                    <Link
                        href="/menu"
                        className="flex items-center bg-white text-primary px-5 py-2 md:px-6 md:py-2 rounded-full font-bold hover:bg-gray-200 transition-all gap-1 cursor-pointer uppercase hover:shadow-lg hover:scale-105 text-sm md:text-base"
                        aria-label="View all menu items"
                    >
                        See All Items
                        <Right className="w-4 h-4 md:w-5 md:h-5" />
                    </Link>
                </div>

                {/* Full-size image modal overlay */}
                {fullImageUrl && (
                    <div
                        className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
                        onClick={closeModal}
                        role="dialog"
                        aria-label="Full size menu item image"
                        aria-modal="true"
                    >
                        {/* Image container with responsive sizing */}
                        <div className="relative w-full max-w-xs sm:max-w-md h-72 sm:h-96">
                            <Image
                                src={fullImageUrl}
                                alt="Full size menu item"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>

                        {/* Close button for the modal */}
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
                            aria-label="Close image viewer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}

export default HomeMenu;