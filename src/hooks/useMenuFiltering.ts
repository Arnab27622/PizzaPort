import { useState, useMemo, useCallback } from "react";
import { MenuItem } from "@/types/menu";

export function useMenuFiltering(items: MenuItem[]) {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<string>("");

    const categories = useMemo(() => {
        const cats = items
            .map(item => item.category)
            .filter((cat): cat is string => !!cat);
        return Array.from(new Set(cats)).sort();
    }, [items]);

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = activeCategory ? item.category === activeCategory : true;
            return matchesSearch && matchesCategory;
        });
    }, [items, search, activeCategory]);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    }, []);

    const handleCategoryChange = useCallback((category: string) => {
        setActiveCategory(prev => prev === category ? "" : category);
    }, []);

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
