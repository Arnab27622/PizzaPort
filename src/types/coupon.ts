/**
 * This file defines the "Types" for Coupons.
 * It helps our app understand what a coupon looks like in the database, 
 * on the website, and in our forms.
 */

/**
 * The structure of a Coupon as stored in the MongoDB database.
 * (Prefix 'I' usually stands for 'Interface' or 'Internal').
 */
export interface ICoupon {
    code: string;           // The discount code (e.g., "WELCOMETEN")
    discountType: "percentage" | "fixed"; // Either % off or fixed amount off
    discountValue: number;  // The actual number (e.g., 10 for 10%)
    minOrderValue?: number; // Minimum spend required to use it
    maxDiscount?: number;   // Max savings allowed (for percentage coupons)
    expiryDate?: Date;      // When it stops working
    usageLimit?: number;    // Max number of times it can be used globally
    usageCount: number;     // How many times it has been used so far
    isActive: boolean;      // Whether it is currently enabled
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * The structure of a Coupon as used on the website (the "Frontend").
 * We use string for the ID and expiry date to make it easier to work with JSON.
 */
export interface Coupon {
    _id: string;            // The unique ID from the database
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderValue?: number;
    maxDiscount?: number;
    expiryDate?: string;    // Date as a string (easier for input fields)
    usageLimit?: number;
    usageCount: number;
    isActive: boolean;
}

/**
 * Information about a coupon from a specific user's perspective.
 */
export interface UserCoupon {
    _id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderValue?: number;
    maxDiscount?: number;
    expiryDate?: string;
    usageLimit?: number;
    userUsageCount: number;   // How many times THIS specific user has used it
    remainingUses: number | null; // How many more times they can use it
}

/**
 * Used for the "Create/Edit Coupon" form.
 * Note that numbers are stored as strings here because HTML inputs always return strings.
 */
export interface CouponFormState {
    id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: string;
    minOrderValue: string;
    maxDiscount: string;
    expiryDate: string;
    usageLimit: string;
    isActive: boolean;
}

/**
 * Props for the component that lists coupons in the Admin dashboard.
 */
export interface CouponListProps {
    coupons: Coupon[];
    onEdit: (coupon: Coupon) => void;
    onDelete: (coupon: Coupon) => void;
    isDeletingId: string | null; // ID of the coupon currently being deleted
}

/**
 * Props for the popup form used to add or edit a coupon.
 */
export interface CouponFormProps {
    coupon?: Coupon | null; // The coupon to edit (null if adding new)
    onClose: () => void;    // Function to close the popup
    onSuccess: () => void;  // Function called after successfully saving
}

/**
 * The response we get from the server when checking if a coupon is valid.
 */
export interface CouponValidationResponse {
    valid: boolean;    // Is the coupon working?
    message: string;   // "Coupon Applied!" or "Coupon Expired!"
    discount?: number; // The amount of money saved
    coupon?: Coupon;   // The details of the coupon
}

