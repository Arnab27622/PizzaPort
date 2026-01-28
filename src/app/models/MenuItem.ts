// MenuItem.ts
import mongoose, { Schema, Model } from "mongoose";

import { IMenuItem, OptionEntry } from "@/types/menu";

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
        discountPrice: { type: Number },
        category: { type: String, required: true },
        sizeOptions: { type: [OptionEntrySchema], default: [] },
        extraIngredients: { type: [OptionEntrySchema], default: [] },
        imageUrl: { type: String },
    },
    { timestamps: true }
);

export const MenuItem: Model<IMenuItem> =
    mongoose.models.MenuItem || mongoose.model<IMenuItem>("MenuItem", MenuItemSchema);