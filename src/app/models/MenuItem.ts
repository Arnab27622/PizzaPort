/**
 * This file defines the "MenuItem" model.
 * A MenuItem represents a food item on the menu, like a pizza or a drink.
 */

import mongoose, { Schema, Model } from "mongoose";
import { IMenuItem, OptionEntry } from "@/types/menu";

/**
 * OptionEntrySchema defines the structure for small options like "Size" or "Extra Ingredients".
 * Each option has a name and an extra cost.
 */
const OptionEntrySchema = new Schema<OptionEntry>({
    name: { type: String, required: true },
    extraPrice: { type: Number, required: true },
});

/**
 * MenuItemSchema defines what information we store for each food item.
 */
const MenuItemSchema = new Schema<IMenuItem>(
    {
        name: { type: String, required: true },       // Name of the pizza, e.g., "Margherita"
        description: { type: String },                // Brief description of the item
        basePrice: { type: Number, required: true },    // Starting price of the item
        discountPrice: { type: Number },              // Optional sale price
        category: { type: String, required: true },   // Category, e.g., "Pizzas" or "Drinks"
        sizeOptions: { type: [OptionEntrySchema], default: [] },      // Sizes like Small, Medium, Large
        extraIngredients: { type: [OptionEntrySchema], default: [] }, // Toppings like Extra Cheese
        imageUrl: { type: String },                   // Link to the image of the food
        cloudinaryPublicId: { type: String },         // Internal ID for the image (used for deleting images)
    },
    { timestamps: true } // Adds createdAt and updatedAt automatically
);

// Optimize category filtering with an index
MenuItemSchema.index({ category: 1 });

/**
 * The MenuItem model represents the "menuitems" collection in MongoDB.
 */
export const MenuItem: Model<IMenuItem> =
    mongoose.models.MenuItem || mongoose.model<IMenuItem>("MenuItem", MenuItemSchema);
