import React from "react";

interface CategoryFiltersProps {
    categories: string[];
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

const CategoryFilters: React.FC<CategoryFiltersProps> = ({
    categories,
    activeCategory,
    onCategoryChange
}) => {
    if (categories.length === 0) return null;

    return (
        <div className="flex flex-wrap justify-center gap-3 mb-10">
            <button
                key="all"
                onClick={() => onCategoryChange("")}
                className={`px-4 py-2 rounded-full border border-amber-800 text-sm transition-all cursor-pointer ${!activeCategory
                    ? "bg-primary text-white"
                    : "bg-[#1a1108] text-amber-200 hover:bg-amber-900/60"
                    }`}
            >
                All Items
            </button>
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => onCategoryChange(cat)}
                    className={`px-4 py-2 rounded-full border border-amber-800 text-sm transition-all cursor-pointer ${activeCategory === cat
                        ? "bg-primary text-white"
                        : "bg-[#1a1108] text-amber-200 hover:bg-amber-900/60"
                        }`}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
};

export default CategoryFilters;
