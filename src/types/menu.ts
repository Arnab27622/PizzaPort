export interface Option {
    name: string;
    extraPrice: number;
}

export interface OptionForm extends Omit<Option, 'extraPrice'> {
    extraPrice: string;
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
