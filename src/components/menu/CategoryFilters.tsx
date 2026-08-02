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

const CategoryFilters: React.FC<CategoryFiltersProps> = React.memo(({
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
                className={`px-5 py-2.5 rounded-full border text-sm font-semibold transition-all duration-300 cursor-pointer ${!activeCategory
                    ? "bg-linear-to-r from-red-600 via-orange-600 to-amber-600 text-white font-extrabold shadow-lg shadow-red-950/60 scale-105 border-amber-400/40"
                    : "bg-[#18120c]/95 text-amber-100 font-bold border-amber-900/60 hover:border-amber-500/60 hover:bg-[#241b12] hover:text-white shadow-md"
                    }`}
            >
                All Items
            </button>
            {/* Buttons for each category */}
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => onCategoryChange(cat)}
                    className={`px-5 py-2.5 rounded-full border text-sm font-semibold transition-all duration-300 cursor-pointer ${activeCategory === cat
                        ? "bg-linear-to-r from-red-600 via-orange-600 to-amber-600 text-white font-extrabold shadow-lg shadow-red-950/60 scale-105 border-amber-400/40"
                        : "bg-[#18120c]/95 text-amber-100 font-bold border-amber-900/60 hover:border-amber-500/60 hover:bg-[#241b12] hover:text-white shadow-md"
                        }`}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
});

CategoryFilters.displayName = "CategoryFilters";

export default CategoryFilters;

