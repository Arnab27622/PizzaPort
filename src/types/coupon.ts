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

export interface Coupon {
    _id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderValue?: number;
    maxDiscount?: number;
    expiryDate?: string;
    usageLimit?: number;
    usageCount: number;
    isActive: boolean;
}

export interface UserCoupon {
    _id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderValue?: number;
    maxDiscount?: number;
    expiryDate?: string;
    usageLimit?: number;
    userUsageCount: number;
    remainingUses: number | null;
}


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

export interface CouponListProps {
    coupons: Coupon[];
    onEdit: (coupon: Coupon) => void;
    onDelete: (coupon: Coupon) => void;
    isDeletingId: string | null;
}

export interface CouponFormProps {
    coupon?: Coupon | null;
    onClose: () => void;
    onSuccess: () => void;
}

export interface CouponValidationResponse {
    valid: boolean;
    message: string;
    discount?: number;
    coupon?: Coupon;
}
