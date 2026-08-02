"use client";

/**
 * A simple search bar for the menu.
 * It lets users type text to filter items (e.g., type "Pepperoni" to find it).
 */

import React from "react";
import SearchIcon from "@/components/icons/SearchIcon";

interface MenuSearchProps {
    value: string; // The current text in the search box
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Function called when text changes
}

const MenuSearch: React.FC<MenuSearchProps> = React.memo(({ value, onChange }) => {
    return (
        <div className="mb-6 max-w-md mx-auto relative">
            {/* Search Icon */}
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-500/50">
                <SearchIcon />
            </div>

            {/* Input Field */}
            <input
                type="text"
                placeholder="Search for delicious pizza, drinks, sides..."
                value={value}
                onChange={onChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#18120c]/95 border border-amber-900/60 text-white placeholder:text-amber-200/60 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/40 transition-all duration-300 shadow-xl"
                aria-label="Search menu items"
            />
        </div>
    );
});

MenuSearch.displayName = "MenuSearch";

export default MenuSearch;

