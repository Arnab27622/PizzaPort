import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { Coupon } from "@/app/models/Coupon";
import dbConnect from "@/lib/mongoose";
import { z } from "zod";

const CouponSchema = z.object({
    code: z.string().min(1, "Code is required").toUpperCase(),
    discountType: z.enum(["percentage", "fixed"]),
    discountValue: z.coerce.number().min(0),
    minOrderValue: z.coerce.number().min(0).optional(),
    maxDiscount: z.coerce.number().min(0).optional(),
    expiryDate: z.string().optional().nullable().transform(val => val ? new Date(val) : undefined),
    usageLimit: z.coerce.number().min(0).optional(),
    isActive: z.boolean().optional().default(true),
});

const CouponUpdateSchema = CouponSchema.partial().extend({
    id: z.string().min(1, "Coupon ID is required"),
});

/**
 * Middleware-like check for admin status
 */
async function isAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.admin) {
        return false;
    }
    return true;
}

/**
 * GET /api/coupon - Fetch all coupons (admin only)
 */
export async function GET() {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
        }

        await dbConnect();
        const coupons = await Coupon.find({}).sort({ createdAt: -1 });

        return NextResponse.json(coupons || []);
    } catch (error) {
        console.error("Error fetching coupons:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * POST /api/coupon - Create a new coupon (admin only)
 */
export async function POST(req: NextRequest) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
        }

        const body = await req.json();
        const validation = CouponSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
        }

        await dbConnect();

        // Check for duplicates
        const existing = await Coupon.findOne({ code: validation.data.code });
        if (existing) {
            return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
        }

        const coupon = await Coupon.create({
            ...validation.data,
            usageCount: 0
        });

        return NextResponse.json(coupon, { status: 201 });
    } catch (error) {
        console.error("Error creating coupon:", error);
        return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
    }
}

/**
 * PUT /api/coupon - Update an existing coupon (admin only)
 */
export async function PUT(req: NextRequest) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
        }

        const body = await req.json();
        const validation = CouponUpdateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
        }

        const { id, ...updateData } = validation.data;

        await dbConnect();

        // If updating code, check for duplicates
        if (updateData.code) {
            const existing = await Coupon.findOne({
                code: updateData.code,
                _id: { $ne: id }
            });

            if (existing) {
                return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
            }
        }

        /**
         * Explicitly exclude usageCount from updates to prevent tampering via API
         */
        const updatedCoupon = await Coupon.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedCoupon) {
            return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
        }

        return NextResponse.json(updatedCoupon);
    } catch (error) {
        console.error("Error updating coupon:", error);
        return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
    }
}

/**
 * DELETE /api/coupon - Delete a coupon (admin only)
 */
export async function DELETE(req: NextRequest) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
        }

        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
        }

        await dbConnect();
        const deletedCoupon = await Coupon.findByIdAndDelete(id);

        if (!deletedCoupon) {
            return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Coupon deleted successfully",
            deletedCoupon
        });
    } catch (error) {
        console.error("Error deleting coupon:", error);
        return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
    }
}
