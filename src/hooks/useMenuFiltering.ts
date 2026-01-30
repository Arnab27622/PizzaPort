/**
 * This custom hook handles searching and filtering for the menu items.
 * It allows users to type in a search box or click on a category to find food.
 */

import { useState, useMemo, useCallback } from "react";
import { MenuItem } from "@/types/menu";

/**
 * useMenuFiltering Hook
 * Takes the full list of menu items and provides search and filter functionality.
 */
export function useMenuFiltering(items: MenuItem[]) {
    const [search, setSearch] = useState("");              // The text the user typed
    const [activeCategory, setActiveCategory] = useState<string>(""); // The category they clicked

    /**
     * Get a unique list of all categories from the items.
     * Sorted alphabetically.
     */
    const categories = useMemo(() => {
        const cats = items
            .map(item => item.category)
            .filter((cat): cat is string => !!cat);
        return Array.from(new Set(cats)).sort();
    }, [items]);

    /**
     * The final list of items to show, after checking both search and category.
     */
    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = activeCategory ? item.category === activeCategory : true;
            return matchesSearch && matchesCategory;
        });
    }, [items, search, activeCategory]);

    // Updates search as the user types
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    }, []);

    // Switches the category (or unselects it if clicked again)
    const handleCategoryChange = useCallback((category: string) => {
        setActiveCategory(prev => prev === category ? "" : category);
    }, []);

    // Clears everything
    const resetFilters = useCallback(() => {
        setSearch("");
        setActiveCategory("");
    }, []);

    return {
        search,
        setSearch,
        activeCategory,
        setActiveCategory,
        categories,
        filteredItems,
        handleSearchChange,
        handleCategoryChange,
        resetFilters
    };
}

