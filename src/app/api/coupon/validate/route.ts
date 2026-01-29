import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { Coupon } from "@/app/models/Coupon";
import clientPromise from "@/lib/mongoConnect";
import dbConnect from "@/lib/mongoose";
import { z } from "zod";

const ValidateCouponSchema = z.object({
    code: z.string().min(1, "Please enter a coupon code").toUpperCase(),
    subtotal: z.number().positive("Invalid order amount"),
});

/**
 * POST /api/coupon/validate - Validate a coupon code
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                {
                    valid: false,
                    message: "Please log in to use coupons"
                },
                { status: 401 }
            );
        }

        const body = await req.json();
        const validation = ValidateCouponSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({
                valid: false,
                message: validation.error.issues[0].message
            });
        }

        const { code, subtotal } = validation.data;

        await dbConnect();

        // Find the coupon
        const coupon = await Coupon.findOne({ code });

        if (!coupon) {
            return NextResponse.json({
                valid: false,
                message: "Invalid coupon code"
            });
        }

        // Check if coupon is active
        if (!coupon.isActive) {
            return NextResponse.json({
                valid: false,
                message: "This coupon is no longer active"
            });
        }

        // Check expiry date
        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
            return NextResponse.json({
                valid: false,
                message: "This coupon has expired"
            });
        }

        // Check usage limit (PER-USER)
        if (coupon.usageLimit) {
            const client = await clientPromise;
            const db = client.db();
            const userUsageCount = await db.collection("orders").countDocuments({
                userEmail: session.user.email,
                couponCode: coupon.code,
                paymentStatus: { $in: ["verified", "completed"] }
            });

            if (userUsageCount >= coupon.usageLimit) {
                return NextResponse.json({
                    valid: false,
                    message: `You have reached the usage limit (${coupon.usageLimit}) for this coupon`
                });
            }
        }

        // Check minimum order value
        if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
            return NextResponse.json({
                valid: false,
                message: `Minimum order value of ₹${coupon.minOrderValue} required`
            });
        }

        // Calculate discount
        let discount = 0;

        if (coupon.discountType === "percentage") {
            discount = Math.round((subtotal * coupon.discountValue) / 100);

            // Apply max discount cap if specified
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        } else if (coupon.discountType === "fixed") {
            discount = Math.min(coupon.discountValue, subtotal);
        }

        return NextResponse.json({
            valid: true,
            message: `Coupon applied! You saved ₹${discount}`,
            discount,
            coupon: {
                _id: coupon._id,
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                maxDiscount: coupon.maxDiscount
            }
        });
    } catch (error) {
        console.error("Error validating coupon:", error);
        return NextResponse.json(
            {
                valid: false,
                message: "Failed to validate coupon"
            },
            { status: 500 }
        );
    }
}
