/**
 * This custom hook handles the logic for the "Create or Edit Menu Item" form.
 * It manages text fields, image uploads, and lists of sizes and toppings.
 */

import { useState, useCallback, useEffect, ChangeEvent, FormEvent } from 'react';
import { MenuItem, MenuItemFormState, UseMenuItemFormProps } from '@/types/menu';
import { toast } from 'react-toastify';

/**
 * useMenuItemForm Hook
 * Takes success and close handlers to call after form submission.
 */
export function useMenuItemForm({ onSuccess, onClose }: UseMenuItemFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false); // True when saving to the server
    const [form, setForm] = useState<MenuItemFormState>({
        id: "",
        name: "",
        category: "",
        basePrice: "",
        discountPrice: "",
        description: "",
        imageFile: null,
        imagePreview: "",
        sizeOptions: [],
        extraIngredients: []
    });

    /**
     * When we show an image preview, we create a temporary URL.
     * This cleanup function removes that URL when it's no longer needed to save memory.
     */
    useEffect(() => {
        return () => {
            if (form.imagePreview) {
                URL.revokeObjectURL(form.imagePreview);
            }
        };
    }, [form.imagePreview]);

    /**
     * Fills the form with data if we are EDITING an item, 
     * or resets it if we are ADDING a new one.
     */
    const initializeForm = useCallback((item?: MenuItem) => {
        if (item) {
            setForm({
                id: item._id,
                name: item.name,
                category: item.category,
                basePrice: item.basePrice.toString(),
                discountPrice: item.discountPrice?.toString() ?? "",
                description: item.description ?? "",
                imageFile: null,
                imagePreview: item.imageUrl || "",
                sizeOptions: item.sizeOptions.map(o => ({
                    name: o.name,
                    extraPrice: o.extraPrice.toString()
                })),
                extraIngredients: item.extraIngredients.map(o => ({
                    name: o.name,
                    extraPrice: o.extraPrice.toString()
                })),
            });
        } else {
            setForm({
                id: "",
                name: "",
                category: "",
                basePrice: "",
                discountPrice: "",
                description: "",
                imageFile: null,
                imagePreview: "",
                sizeOptions: [],
                extraIngredients: []
            });
        }
    }, []);

    // Handles changes for normal text inputs
    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }, []);

    // Handles picking an image file from the computer
    const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (form.imagePreview && form.imageFile) {
            URL.revokeObjectURL(form.imagePreview);
        }
        const preview = file ? URL.createObjectURL(file) : "";
        setForm(prev => ({ ...prev, imageFile: file, imagePreview: preview }));
    }, [form.imagePreview, form.imageFile]);

    /**
     * Handles changes for "Options" (sizes or toppings).
     */
    const handleOptionChange = useCallback((
        key: "sizeOptions" | "extraIngredients",
        idx: number,
        field: "name" | "extraPrice",
        value: string
    ) => {
        setForm(prev => {
            const arr = [...prev[key]];
            arr[idx] = { ...arr[idx], [field]: value };
            return { ...prev, [key]: arr };
        });
    }, []);

    // Adds a new blank option row
    const addOption = useCallback((key: "sizeOptions" | "extraIngredients") => {
        setForm(prev => ({
            ...prev,
            [key]: [...prev[key], { name: "", extraPrice: "" }]
        }));
    }, []);

    // Removes an option row
    const removeOption = useCallback((key: "sizeOptions" | "extraIngredients", idx: number) => {
        setForm(prev => {
            const arr = [...prev[key]];
            arr.splice(idx, 1);
            return { ...prev, [key]: arr };
        });
    }, []);

    /**
     * Submits the form data to the server.
     * Uses FormData because we need to upload an image.
     */
    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const fd = new FormData();
            fd.append("name", form.name);
            fd.append("category", form.category);
            fd.append("basePrice", form.basePrice);
            if (form.discountPrice && parseFloat(form.discountPrice) > 0) {
                fd.append("discountPrice", form.discountPrice);
            }
            fd.append("description", form.description);

            // Convert option arrays to JSON strings so they can be sent via FormData
            const sizeOptions = form.sizeOptions.map(o => ({
                name: o.name,
                extraPrice: parseFloat(o.extraPrice) || 0
            }));

            const extraIngredients = form.extraIngredients.map(o => ({
                name: o.name,
                extraPrice: parseFloat(o.extraPrice) || 0
            }));

            fd.append("sizeOptions", JSON.stringify(sizeOptions));
            fd.append("extraIngredients", JSON.stringify(extraIngredients));

            if (form.imageFile) fd.append("image", form.imageFile);
            if (form.id) fd.append("id", form.id);

            // Use PUT if editing, POST if creating new
            const method = form.id ? "PUT" : "POST";
            const response = await fetch("/api/menuitem", { method, body: fd });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || `Failed to ${form.id ? 'update' : 'create'} menu item`);
            }

            toast.success(`Menu item ${form.id ? 'updated' : 'created'} successfully`);
            onSuccess();
            onClose();

        } catch (error) {
            console.error("Error saving menu item:", error);
            toast.error(error instanceof Error ? error.message : "Failed to save menu item");
        } finally {
            setIsSubmitting(false);
        }
    }, [form, onSuccess, onClose]);

    return {
        form,
        isSubmitting,
        initializeForm,
        handleChange,
        handleFileChange,
        handleOptionChange,
        addOption,
        removeOption,
        handleSubmit
    };
}

