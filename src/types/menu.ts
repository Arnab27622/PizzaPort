export interface Option {
    name: string;
    extraPrice: number;
}

export interface OptionForm extends Omit<Option, 'extraPrice'> {
    extraPrice: string;
}

export interface OptionEntry {
    name: string;
    extraPrice: number;
}

export interface IMenuItem {
    name: string;
    description: string;
    basePrice: number;
    discountPrice?: number;
    category: string;
    sizeOptions: OptionEntry[];
    extraIngredients: OptionEntry[];
    imageUrl?: string;
    cloudinaryPublicId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface MenuItemDB {
    name: string;                                           // Item name (required)
    description?: string;                                   // Optional item description
    basePrice: number;                                      // Base price without extras
    discountPrice?: number;                                 // Optional promotional/discount price
    category: string;                                       // Food category (e.g., Pizza, Burger)
    sizeOptions: { name: string; extraPrice: number }[];    // Size variations with pricing
    extraIngredients: { name: string; extraPrice: number }[]; // Additional ingredients with costs
    imageUrl?: string;                                      // Optional image path
    cloudinaryPublicId?: string;                            // Cloudinary public_id for deletion
    createdAt: Date;                                        // Record creation timestamp
    updatedAt: Date;                                        // Last update timestamp
}

export interface MenuItem {
    _id: string;
    name: string;
    description: string;
    basePrice: number;
    discountPrice?: number;
    category: string;
    imageUrl?: string;
    sizeOptions: Option[];
    extraIngredients: Option[];
}

export interface MenuItemFormState {
    id: string;
    name: string;
    category: string;
    basePrice: string;
    discountPrice: string;
    description: string;
    imageFile: File | null;
    imagePreview: string;
    sizeOptions: OptionForm[];
    extraIngredients: OptionForm[];
}

export interface UseMenuItemFormProps {
    onSuccess: () => void;
    onClose: () => void;
}

export interface MenuItemOptionFieldsProps {
    label: string;
    options: OptionForm[];
    onAdd: () => void;
    onChange: (idx: number, field: "name" | "extraPrice", value: string) => void;
    onRemove: (idx: number) => void;
}

export interface MenuItemCardProps {
    item: MenuItem;
    onImageClick?: () => void;
}

export interface ProductCustomizationModalProps {
    item: MenuItem;
    onClose: () => void;
    onConfirm: (size: Option | null, extras: Option[]) => void;
}

export interface MenuItemGridProps {
    items: MenuItem[];
    isLoading: boolean;
    error?: Error;
    onEdit: (item: MenuItem) => void;
    onDelete: (item: MenuItem) => void;
    onImageClick: (imageUrl: string) => void;
    isDeletingId: string | null;
}

export interface MenuItemFormProps {
    item?: MenuItem | null;
    onClose: () => void;
    onSuccess: () => void;
}
