"use client";

/**
 * This component shows buttons for each category (like "Pizza", "Drinks").
 * Clicking a button filters the menu to show only items from that category.
 */

import React from "react";

interface CategoryFiltersProps {
    categories: string[]; // List of all available categories
    activeCategory: string; // The currently selected category (empty means "All")
    onCategoryChange: (category: string) => void; // Function to update the selected category
}

const CategoryFilters: React.FC<CategoryFiltersProps> = ({
    categories,
    activeCategory,
    onCategoryChange
}) => {
    // If there are no categories, don't show anything
    if (categories.length === 0) return null;

    return (
        <div className="flex flex-wrap justify-center gap-3 mb-10">
            {/* Button to show All items */}
            <button
                key="all"
                onClick={() => onCategoryChange("")}
                className={`px-4 py-2 rounded-full border border-amber-800 text-sm transition-all cursor-pointer ${!activeCategory
                    ? "bg-primary text-white"
                    : "bg-[#151515] text-amber-200 hover:bg-black/50"
                    }`}
            >
                All Items
            </button>
            {/* Buttons for each category */}
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => onCategoryChange(cat)}
                    className={`px-4 py-2 rounded-full border border-amber-800 text-sm transition-all cursor-pointer ${activeCategory === cat
                        ? "bg-primary text-white"
                        : "bg-[#151515] text-amber-200 hover:bg-black/50"
                        }`}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
};

export default CategoryFilters;

