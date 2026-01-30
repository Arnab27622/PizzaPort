/**
 * This file defines the "Coupon" model.
 * Coupons are used to give discounts to customers during checkout.
 */

import mongoose, { Schema, Model } from "mongoose";
import { ICoupon } from "@/types/coupon";

/**
 * CouponSchema defines what information we store for each coupon in the database.
 */
const CouponSchema = new Schema<ICoupon>(
    {
        // The unique code the user types (e.g., "PIZZA50")
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },
        // Whether it's a percentage (e.g., 10%) or a fixed amount (e.g., ₹50)
        discountType: {
            type: String,
            required: true,
            enum: ["percentage", "fixed"]
        },
        // The value of the discount (e.g., 10 or 50)
        discountValue: {
            type: Number,
            required: true,
            min: 0
        },
        // Minimum order amount needed to use this coupon
        minOrderValue: {
            type: Number,
            min: 0
        },
        // Maximum discount allowed (mostly for percentage-based coupons)
        maxDiscount: {
            type: Number,
            min: 0
        },
        // When the coupon expires
        expiryDate: { type: Date },
        // How many times this coupon can be used in total
        usageLimit: {
            type: Number,
            min: 0
        },
        // How many times it has already been used
        usageCount: {
            type: Number,
            default: 0,
            min: 0
        },
        // Whether the coupon is currently active or disabled
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true } // Automatically adds "createdAt" and "updatedAt"
);

// We add an index to "code" and "isActive" to make searching for coupons faster
CouponSchema.index({ code: 1, isActive: 1 });

/**
 * The Coupon model represents the "coupons" collection in MongoDB.
 */
export const Coupon: Model<ICoupon> =
    mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema);

