import React from "react";
import SearchIcon from "@/components/icons/SearchIcon";

interface MenuSearchProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const MenuSearch: React.FC<MenuSearchProps> = ({ value, onChange }) => {
    return (
        <div className="mb-6 max-w-md mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-500/50">
                <SearchIcon />
            </div>
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
