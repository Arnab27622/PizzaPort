import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Coupon } from "@/app/models/Coupon";
import clientPromise from "@/lib/mongoConnect";
import mongoose from "mongoose";

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

        // Connect to MongoDB
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URL!);
        }
        await clientPromise;

        const body = await req.json();
        const { code, subtotal } = body;

        if (!code) {
            return NextResponse.json({
                valid: false,
                message: "Please enter a coupon code"
            });
        }

        if (!subtotal || subtotal <= 0) {
            return NextResponse.json({
                valid: false,
                message: "Invalid order amount"
            });
        }

        // Find the coupon
        const coupon = await Coupon.findOne({
            code: code.toUpperCase()
        });

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

        // Check usage limit
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            return NextResponse.json({
                valid: false,
                message: "This coupon has reached its usage limit"
            });
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
            discount = coupon.discountValue;

            // Ensure discount doesn't exceed subtotal
            if (discount > subtotal) {
                discount = subtotal;
            }
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
