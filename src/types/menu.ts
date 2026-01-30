/**
 * This file defines everything related to the Menu Item data.
 */

/**
 * A simple option like a size or a topping.
 */
export interface Option {
    name: string;        // Name of the option (e.g., "Large")
    extraPrice: number;  // Extra cost as a number
}

/**
 * Used for the form. In forms, numbers are often handled as strings.
 */
export interface OptionForm extends Omit<Option, 'extraPrice'> {
    extraPrice: string;
}

/**
 * A specific entry for a menu option.
 */
export interface OptionEntry {
    name: string;
    extraPrice: number;
}

/**
 * The structure of a Menu Item as it exists in the database.
 */
export interface IMenuItem {
    name: string;                // Item name (e.g., "Veggie Paradise")
    description: string;         // Brief description
    basePrice: number;           // Starting price
    discountPrice?: number;      // Sale price (if any)
    category: string;            // The group it belongs to (e.g., "Pizza")
    sizeOptions: OptionEntry[];  // Available sizes
    extraIngredients: OptionEntry[]; // Extra toppings
    imageUrl?: string;           // Photo link
    cloudinaryPublicId?: string; // ID for managing the image file
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Similar to IMenuItem, but used for raw database results.
 */
export interface MenuItemDB {
    name: string;
    description?: string;
    basePrice: number;
    discountPrice?: number;
    category: string;
    sizeOptions: { name: string; extraPrice: number }[];
    extraIngredients: { name: string; extraPrice: number }[];
    imageUrl?: string;
    cloudinaryPublicId?: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * The structure of a Menu Item used on the website (the "Frontend").
 */
export interface MenuItem {
    _id: string; // The unique ID from the database
    name: string;
    description: string;
    basePrice: number;
    discountPrice?: number;
    category: string;
    imageUrl?: string;
    sizeOptions: Option[];
    extraIngredients: Option[];
}

/**
 * The data structure for the "Create/Edit Menu Item" form.
 */
export interface MenuItemFormState {
    id: string;
    name: string;
    category: string;
    basePrice: string;    // String because it comes from a text input
    discountPrice: string; // String because it comes from a text input
    description: string;
    imageFile: File | null; // The actual image file if the user uploads one
    imagePreview: string;   // A temporary link to show the image preview
    sizeOptions: OptionForm[];
    extraIngredients: OptionForm[];
}

/**
 * Props for the custom hook that handles menu item form logic.
 */
export interface UseMenuItemFormProps {
    onSuccess: () => void;
    onClose: () => void;
}

/**
 * Props for the component where admins can add/remove sizes and toppings.
 */
export interface MenuItemOptionFieldsProps {
    label: string;
    options: OptionForm[];
    onAdd: () => void;
    onChange: (idx: number, field: "name" | "extraPrice", value: string) => void;
    onRemove: (idx: number) => void;
}

/**
 * Props for the card that displays a pizza on the menu.
 */
export interface MenuItemCardProps {
    item: MenuItem;
    onImageClick?: () => void; // What happens when the user clicks the photo
}

/**
 * Props for the popup where users choose their pizza size and toppings.
 */
export interface ProductCustomizationModalProps {
    item: MenuItem;
    onClose: () => void;
    onConfirm: (size: Option | null, extras: Option[]) => void;
}

/**
 * Props for the grid that shows all menu items in the Admin panel.
 */
export interface MenuItemGridProps {
    items: MenuItem[];
    isLoading: boolean;
    error?: Error;
    onEdit: (item: MenuItem) => void;
    onDelete: (item: MenuItem) => void;
    onImageClick: (imageUrl: string) => void;
    isDeletingId: string | null;
}

/**
 * Props for the entire "Menu Item Form" component.
 */
export interface MenuItemFormProps {
    item?: MenuItem | null;
    onClose: () => void;
    onSuccess: () => void;
}

