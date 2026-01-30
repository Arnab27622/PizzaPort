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

const MenuSearch: React.FC<MenuSearchProps> = ({ value, onChange }) => {
    return (
        <div className="mb-6 max-w-md mx-auto relative">
            {/* Search Icon */}
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-500/50">
                <SearchIcon />
            </div>

            {/* Input Field */}
            <input
                type="text"
                placeholder="Search for pizza..."
                value={value}
                onChange={onChange}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#1a1108] border border-amber-800 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Search menu items"
            />
        </div>
    );
};

export default MenuSearch;

