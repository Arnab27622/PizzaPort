import mongoose, { Schema, Model } from "mongoose";

import { ICoupon } from "@/types/coupon";

/**
 * Mongoose schema for Coupon model.
 */
const CouponSchema = new Schema<ICoupon>(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },
        discountType: {
            type: String,
            required: true,
            enum: ["percentage", "fixed"]
        },
        discountValue: {
            type: Number,
            required: true,
            min: 0
        },
        minOrderValue: {
            type: Number,
            min: 0
        },
        maxDiscount: {
            type: Number,
            min: 0
        },
        expiryDate: { type: Date },
        usageLimit: {
            type: Number,
            min: 0
        },
        usageCount: {
            type: Number,
            default: 0,
            min: 0
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

// Index for faster lookups
CouponSchema.index({ code: 1, isActive: 1 });

export const Coupon: Model<ICoupon> =
    mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema);
