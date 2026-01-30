/**
 * This component displays the list of menu items for the Admin.
 * It shows items in a grid with their images, names, prices, and options to Edit or Delete.
 */

import React from 'react';
import Image from 'next/image';
import LoadingSpinner from '@/components/icons/LoadingSpinner';
import { MenuItemGridProps } from '@/types/menu';

export default function MenuItemGrid({
    items,
    isLoading,
    error,
    onEdit,
    onDelete,
    onImageClick,
    isDeletingId
}: MenuItemGridProps) {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="lg" color="text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 text-red-300 bg-red-900/20 rounded-lg border border-red-900/50">
                <p className="text-xl font-semibold mb-2">Error Loading Menu</p>
                <p>{error.message || "Failed to load menu items. Please try again."}</p>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-20 text-amber-200 border-2 border-dashed border-amber-900/50 rounded-xl bg-amber-900/10">
                <p className="text-2xl font-bold mb-2">No Menu Items Found</p>
                <p>Click &quot;New Item&quot; to add your first delicious creation.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map(item => (
                <div
                    key={item._id}
                    className="group bg-linear-to-br from-[#2c1a0d] to-[#1a1108] border border-amber-900/50 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-amber-700 transition-all duration-300 transform hover:-translate-y-1"
                >
                    {/* Item Image */}
                    <div
                        className="w-full h-48 bg-[#1a1108] relative cursor-pointer overflow-hidden"
                        onClick={() => item.imageUrl && onImageClick(item.imageUrl)}
                    >
                        {item.imageUrl ? (
                            <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-amber-800 bg-amber-950/30">
                                <span className="text-sm">No Image</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                            <h2 className="text-lg font-bold text-amber-50 line-clamp-1" title={item.name}>
                                {item.name}
                            </h2>
                            <span className="text-amber-400 font-bold">
                                ${item.basePrice}
                            </span>
                        </div>

                        {item.description && (
                            <p className="text-amber-200/70 text-sm line-clamp-2 mb-4 h-10">
                                {item.description}
                            </p>
                        )}

                        <div className="flex gap-2 mt-auto pt-3 border-t border-amber-900/30">
                            <button
                                onClick={() => onEdit(item)}
                                className="flex-1 py-2 px-3 rounded-lg border border-amber-600/50 text-amber-500 hover:bg-amber-600 hover:text-white transition-all text-sm font-medium cursor-pointer"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => onDelete(item)}
                                disabled={isDeletingId === item._id}
                                className="flex-1 py-2 px-3 rounded-lg border border-red-600/50 text-red-500 hover:bg-red-600 hover:text-white transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex justify-center items-center"
                            >
                                {isDeletingId === item._id ? (
                                    <LoadingSpinner size="sm" />
                                ) : (
                                    "Delete"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

