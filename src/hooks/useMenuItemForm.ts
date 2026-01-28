import { useState, useCallback, useEffect, ChangeEvent, FormEvent } from 'react';
import { MenuItem, MenuItemFormState, UseMenuItemFormProps } from '@/types/menu';
import { toast } from 'react-toastify';

export function useMenuItemForm({ onSuccess, onClose }: UseMenuItemFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
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

    // Cleanup object URL on unmount or preview change
    useEffect(() => {
        return () => {
            if (form.imagePreview) {
                URL.revokeObjectURL(form.imagePreview);
            }
        };
    }, [form.imagePreview]);

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

    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (form.imagePreview && form.imageFile) {
            URL.revokeObjectURL(form.imagePreview);
        }
        const preview = file ? URL.createObjectURL(file) : "";
        setForm(prev => ({ ...prev, imageFile: file, imagePreview: preview }));
    }, [form.imagePreview, form.imageFile]);

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

    const addOption = useCallback((key: "sizeOptions" | "extraIngredients") => {
        setForm(prev => ({
            ...prev,
            [key]: [...prev[key], { name: "", extraPrice: "" }]
        }));
    }, []);

    const removeOption = useCallback((key: "sizeOptions" | "extraIngredients", idx: number) => {
        setForm(prev => {
            const arr = [...prev[key]];
            arr.splice(idx, 1);
            return { ...prev, [key]: arr };
        });
    }, []);

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

            const method = form.id ? "PUT" : "POST";
            const response = await fetch("/api/menuitem", { method, body: fd });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || `Failed to ${form.id ? 'update' : 'create'} menu item`);
            }

            toast.success(`Menu item ${form.id ? 'updated' : 'created'} successfully`);
            onSuccess();
            onClose();

            // Cleanup on success if needed, though onClose/initialize usually handles reset
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
