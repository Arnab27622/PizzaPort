import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Coupon } from "@/app/models/Coupon";
import clientPromise from "@/lib/mongoConnect";

/**
 * GET /api/coupon - Fetch all coupons (admin only)
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Connect to MongoDB
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URL!);
        }

        // Fetch user to verify admin status
        const db = (await clientPromise).db();
        const userDoc = await db.collection("users").findOne({
            email: session.user.email
        });

        if (!userDoc?.admin) {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        // Fetch all coupons
        // Coupon.find() will return an empty array if none exist, which is a success case.
        const coupons = await Coupon.find({}).sort({ createdAt: -1 });

        return NextResponse.json(coupons || []);
    } catch (error) {
        console.error("Error fetching coupons:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/coupon - Create a new coupon (admin only)
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Connect to MongoDB
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URL!);
        }

        // Check if user is admin
        const db = (await clientPromise).db();
        const userDoc = await db.collection("users").findOne({
            email: session.user.email
        });

        if (!userDoc?.admin) {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const {
            code,
            discountType,
            discountValue,
            minOrderValue,
            maxDiscount,
            expiryDate,
            usageLimit,
            isActive
        } = body;

        // Validation
        if (!code || !discountType || discountValue === undefined) {
            return NextResponse.json(
                { error: "Code, discount type, and discount value are required" },
                { status: 400 }
            );
        }

        if (discountType === "percentage" && (discountValue < 0 || discountValue > 100)) {
            return NextResponse.json(
                { error: "Percentage discount must be between 0 and 100" },
                { status: 400 }
            );
        }

        if (discountType === "fixed" && discountValue < 0) {
            return NextResponse.json(
                { error: "Fixed discount must be positive" },
                { status: 400 }
            );
        }

        // Check if coupon code already exists
        const existingCoupon = await Coupon.findOne({
            code: code.toUpperCase()
        });

        if (existingCoupon) {
            return NextResponse.json(
                { error: "Coupon code already exists" },
                { status: 400 }
            );
        }

        // Create coupon
        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            discountType,
            discountValue: Number(discountValue),
            minOrderValue: minOrderValue ? Number(minOrderValue) : undefined,
            maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
            expiryDate: expiryDate ? new Date(expiryDate) : undefined,
            usageLimit: usageLimit ? Number(usageLimit) : undefined,
            isActive: isActive !== undefined ? isActive : true,
            usageCount: 0
        });

        return NextResponse.json(coupon, { status: 201 });
    } catch (error) {
        console.error("Error creating coupon:", error);
        return NextResponse.json(
            { error: "Failed to create coupon" },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/coupon - Update an existing coupon (admin only)
 */
export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Connect to MongoDB
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URL!);
        }

        // Check if user is admin
        const db = (await clientPromise).db();
        const userDoc = await db.collection("users").findOne({
            email: session.user.email
        });

        if (!userDoc?.admin) {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json(
                { error: "Coupon ID is required" },
                { status: 400 }
            );
        }

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { error: "Invalid coupon ID" },
                { status: 400 }
            );
        }

        // If updating code, check for duplicates
        if (updateData.code) {
            const existingCoupon = await Coupon.findOne({
                code: updateData.code.toUpperCase(),
                _id: { $ne: id }
            });

            if (existingCoupon) {
                return NextResponse.json(
                    { error: "Coupon code already exists" },
                    { status: 400 }
                );
            }
            updateData.code = updateData.code.toUpperCase();
        }

        // Convert string numbers to actual numbers
        if (updateData.discountValue !== undefined) {
            updateData.discountValue = Number(updateData.discountValue);
        }
        if (updateData.minOrderValue !== undefined) {
            updateData.minOrderValue = updateData.minOrderValue ? Number(updateData.minOrderValue) : undefined;
        }
        if (updateData.maxDiscount !== undefined) {
            updateData.maxDiscount = updateData.maxDiscount ? Number(updateData.maxDiscount) : undefined;
        }
        if (updateData.usageLimit !== undefined) {
            updateData.usageLimit = updateData.usageLimit ? Number(updateData.usageLimit) : undefined;
        }
        if (updateData.expiryDate !== undefined) {
            updateData.expiryDate = updateData.expiryDate ? new Date(updateData.expiryDate) : undefined;
        }

        const updatedCoupon = await Coupon.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedCoupon) {
            return NextResponse.json(
                { error: "Coupon not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedCoupon);
    } catch (error) {
        console.error("Error updating coupon:", error);
        return NextResponse.json(
            { error: "Failed to update coupon" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/coupon - Delete a coupon (admin only)
 */
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Connect to MongoDB
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URL!);
        }

        // Check if user is admin
        const db = (await clientPromise).db();
        const userDoc = await db.collection("users").findOne({
            email: session.user.email
        });

        if (!userDoc?.admin) {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        const { id } = await req.json();

        if (!id) {
            return NextResponse.json(
                { error: "Coupon ID is required" },
                { status: 400 }
            );
        }

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { error: "Invalid coupon ID" },
                { status: 400 }
            );
        }

        const deletedCoupon = await Coupon.findByIdAndDelete(id);

        if (!deletedCoupon) {
            return NextResponse.json(
                { error: "Coupon not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Coupon deleted successfully",
            deletedCoupon
        });
    } catch (error) {
        console.error("Error deleting coupon:", error);
        return NextResponse.json(
            { error: "Failed to delete coupon" },
            { status: 500 }
        );
    }
}
