// MenuItem.ts
import mongoose, { Schema, Document, Model, ObjectId } from "mongoose";

/**
 * Represents an option entry with name and extra price.
 * @interface OptionEntry
 * @property {string} name - The name of the option.
 * @property {number} extraPrice - The additional price for this option.
 */
interface OptionEntry {
    name: string;
    extraPrice: number;
}

/**
 * Represents a menu item in the system.
 * @interface IMenuItem
 * @extends {Document}
 * @property {ObjectId} _id - The unique identifier for the menu item.
 * @property {string} name - The name of the menu item.
 * @property {string} description - The description of the menu item.
 * @property {number} basePrice - The base price of the menu item.
 * @property {string} category - The category of the menu item.
 * @property {OptionEntry[]} sizeOptions - Available size options for the menu item.
 * @property {OptionEntry[]} extraIngredients - Available extra ingredients for the menu item.
 * @property {string} [imageUrl] - The image URL of the menu item.
 * @property {Date} createdAt - When the menu item was created.
 * @property {Date} updatedAt - When the menu item was last updated.
 */
export interface IMenuItem extends Document {
    _id: ObjectId;
    name: string;
    description: string;
    basePrice: number;
    category: string;
    sizeOptions: OptionEntry[];
    extraIngredients: OptionEntry[];
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Schema for option entries (size options and extra ingredients).
 */
const OptionEntrySchema = new Schema<OptionEntry>({
    name: { type: String, required: true },
    extraPrice: { type: Number, required: true },
});

/**
 * Mongoose schema for MenuItem model.
 */
const MenuItemSchema = new Schema<IMenuItem>(
    {
        name: { type: String, required: true },
        description: { type: String },
        basePrice: { type: Number, required: true },
        category: { type: String, required: true },
        sizeOptions: { type: [OptionEntrySchema], default: [] },
        extraIngredients: { type: [OptionEntrySchema], default: [] },
        imageUrl: { type: String },
    },
    { timestamps: true }
);

export const MenuItem: Model<IMenuItem> =
    mongoose.models.MenuItem || mongoose.model<IMenuItem>("MenuItem", MenuItemSchema);