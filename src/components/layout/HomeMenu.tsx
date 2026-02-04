"use client";

/**
 * This section on the home page shows the "Best Sellers" or featured menu items.
 * It automatically fetches the top items from the server and displays them.
 */

import React, { useState, useCallback } from 'react';
import useSWR from 'swr';
import SectionHeader from './SectionHeader';
import MenuItemCard from './MenuItemCard';
import LoadingSpinner from '../icons/LoadingSpinner';
import Link from 'next/link';
import Right from '../icons/Right';
import SharedImageModal from '../common/SharedImageModal';

import { MenuItem } from '@/types/menu';

// Helper function to fetch data from a URL
const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
});

function HomeMenu() {
    // Fetch bestsellers from the API
    const { data: menuItems = [], error, isLoading } = useSWR<MenuItem[]>('/api/menuitem/bestsellers', fetcher, {
        refreshInterval: 120000, // Refresh every 2 minutes
        revalidateOnFocus: false, // Don't refresh just because the user clicked the window
        dedupingInterval: 60000, // Don't make duplicate requests within 1 minute
        keepPreviousData: true, // Keep showing old data while fetching new data
    });

    const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);

    const closeModal = useCallback(() => {
        setFullImageUrl(null);
    }, []);

    // Show spinner while loading
    if (isLoading) {
        return (
            <section className='px-4 py-12'>
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

    // Show error message if fetch fails
    if (error) {
        return (
            <section className='px-4 py-12'>
                <div className='relative max-w-6xl mx-auto'>
                    <SectionHeader subHeader="Check out" mainHeader="Our Best Sellers" />
                    <div className="max-w-xl mx-auto p-6 text-center">
                        <div className="bg-red-900/30 border border-red-800 rounded-lg p-6">
                            <h3 className="text-xl font-semibold text-red-300 mb-2">Error Loading Menu</h3>
                            <p className="text-amber-200">{(error as Error).message}</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className='px-4 py-12'>
            <div className='relative max-w-6xl mx-auto'>
                <SectionHeader subHeader="Check out" mainHeader="Our Best Sellers" />

                {/* Grid of menu items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {menuItems.map(item => (
                        <MenuItemCard
                            key={item._id}
                            item={item}
                            onImageClick={() => item.imageUrl && setFullImageUrl(item.imageUrl)}
                        />
                    ))}
                </div>

                <div className="mt-10 flex justify-center">
                    <Link
                        href="/menu"
                        className="flex items-center bg-white text-primary px-5 py-2 md:px-6 md:py-2 rounded-full font-bold hover:bg-gray-100 transition-all gap-1 cursor-pointer uppercase hover:shadow-lg hover:scale-105 text-sm md:text-base"
                    >
                        See All Items
                        <Right className="w-4 h-4 md:w-5 md:h-5" />
                    </Link>
                </div>

                {/* Modal for viewing images full screen */}
                <SharedImageModal imageUrl={fullImageUrl} onClose={closeModal} />
            </div>
        </section>
    );
}

export default HomeMenu;
