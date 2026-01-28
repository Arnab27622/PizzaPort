export interface Coupon {
    _id: string;
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

export interface CouponFormState {
    id: string;
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: string;
    minOrderValue: string;
    maxDiscount: string;
    expiryDate: string;
    usageLimit: string;
    isActive: boolean;
}

export interface CouponValidationResponse {
    valid: boolean;
    message: string;
    discount?: number;
    coupon?: Coupon;
}
