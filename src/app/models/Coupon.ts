import mongoose, { Schema, Model } from "mongoose";

/**
 * Represents a discount coupon in the system.
 * @interface ICoupon
 * @property {string} code - Unique coupon code (e.g., "FIRST50", "PIZZA20")
 * @property {string} discountType - Type of discount: "percentage" or "fixed"
 * @property {number} discountValue - Discount value (percentage or rupees)
 * @property {number} [minOrderValue] - Minimum order value required to use coupon
 * @property {number} [maxDiscount] - Maximum discount amount (for percentage discounts)
 * @property {Date} [expiryDate] - When the coupon expires
 * @property {number} [usageLimit] - Maximum number of times coupon can be used
 * @property {number} usageCount - Current usage count
 * @property {boolean} isActive - Whether the coupon is currently active
 * @property {Date} createdAt - When the coupon was created
 * @property {Date} updatedAt - When the coupon was last updated
 */
export interface ICoupon {
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    minOrderValue?: number;
    maxDiscount?: number;
    expiryDate?: Date;
    usageLimit?: number;
    usageCount: number;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

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
