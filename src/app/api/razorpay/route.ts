import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoConnect";
import crypto from 'crypto';
import { CartProduct } from "@/types/cart";
import { RazorpayOrderResponse } from "@/types/payment";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import { ObjectId } from "mongodb";
import { MenuItemDB } from "@/types/menu";

const RazorpayOrderSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    address: z.string().min(5, 'Address is too short'),
    cart: z.array(z.any()).min(1, 'Cart is empty'),
    couponCode: z.string().optional(),
    discountAmount: z.number().optional()
});


/**
 * POST /api/payment/create-order
 * Creates a Razorpay payment order and stores order details in database
 * 
 * This endpoint handles the initial payment order creation flow:
 * 1. Validates user authentication
 * 2. Recalculates order totals server-side using database prices (SECURITY CRITICAL)
 * 3. Creates Razorpay payment order
 * 4. Generates security hash for cart integrity
 * 5. Stores order in MongoDB for future reference
 */
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json(
            { success: false, error: "Unauthorized. Please log in." },
            { status: 401 }
        );
    }

    const email = session.user.email;
    const clientDB = await clientPromise;
    const db = clientDB.db();
    const payload = await req.json();

    const validation = RazorpayOrderSchema.safeParse(payload);

    if (!validation.success) {
        return NextResponse.json(
            { success: false, error: validation.error.issues[0].message },
            { status: 400 },
        );
    }

    const { name, cart, address, couponCode } = validation.data;

    /**
     * SECURE PRICE CALCULATION
     * Fetch actual prices from database to prevent client-side tampering
     */
    let subtotal = 0;
    try {
        // Collect all unique item IDs from the cart
        const itemIds = cart.map((item: CartProduct) => new ObjectId(item._id));
        const dbItems = await db.collection<MenuItemDB>("menuitems").find({
            _id: { $in: itemIds }
        }).toArray();

        // Create a map for quick lookup
        const itemsMap = new Map(dbItems.map(item => [item._id.toString(), item]));

        for (const cartItem of cart) {
            const dbItem = itemsMap.get(cartItem._id);
            if (!dbItem) {
                throw new Error(`Item ${cartItem.name} no longer exists.`);
            }

            // Use database prices
            const basePrice = (dbItem.discountPrice && dbItem.discountPrice < dbItem.basePrice)
                ? dbItem.discountPrice
                : dbItem.basePrice;

            let itemTotal = basePrice;

            // Validate size
            if (cartItem.size) {
                const dbSize = dbItem.sizeOptions.find(so => so.name === cartItem.size?.name);
                if (!dbSize) throw new Error(`Invalid size for ${cartItem.name}`);
                itemTotal += dbSize.extraPrice;
            }

            // Validate extras
            if (cartItem.extras && cartItem.extras.length > 0) {
                for (const extra of cartItem.extras) {
                    const dbExtra = dbItem.extraIngredients.find(ei => ei.name === extra.name);
                    if (!dbExtra) throw new Error(`Invalid extra ingredient for ${cartItem.name}`);
                    itemTotal += dbExtra.extraPrice;
                }
            }

            subtotal += itemTotal;
        }
    } catch (err) {
        return NextResponse.json(
            { success: false, error: (err as Error).message || "Pricing validation failed" },
            { status: 400 }
        );
    }

    // Apply tax (5%) and conditional delivery fee
    const tax = Math.round(subtotal * 0.05);
    const deliveryFee = subtotal >= 400 ? 0 : 50;

    let finalDiscount = 0;
    let validatedCouponCode = null;

    if (couponCode) {
        try {
            const coupon = await db.collection("coupons").findOne({
                code: couponCode.toUpperCase(),
                isActive: true
            });

            if (coupon) {
                const now = new Date();
                const isNotExpired = !coupon.expiryDate || new Date(coupon.expiryDate) > now;

                const userUsageCount = await db.collection("orders").countDocuments({
                    userEmail: email,
                    couponCode: coupon.code,
                    paymentStatus: { $in: ["verified", "completed"] }
                });

                const isWithinLimit = !coupon.usageLimit || userUsageCount < coupon.usageLimit;
                const isMinOrderMet = !coupon.minOrderValue || subtotal >= coupon.minOrderValue;

                if (isNotExpired && isWithinLimit && isMinOrderMet) {
                    validatedCouponCode = coupon.code;

                    if (coupon.discountType === "percentage") {
                        let calcDiscount = Math.round((subtotal * coupon.discountValue) / 100);
                        if (coupon.maxDiscount && calcDiscount > coupon.maxDiscount) {
                            calcDiscount = coupon.maxDiscount;
                        }
                        finalDiscount = calcDiscount;
                    } else if (coupon.discountType === "fixed") {
                        finalDiscount = Math.min(coupon.discountValue, subtotal);
                    }
                }
            }
        } catch (error) {
            console.error("Error validating coupon server-side:", error);
            finalDiscount = 0;
        }
    }

    const total = Math.max(0, subtotal + tax + deliveryFee - finalDiscount);

    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_SECRET_KEY!,
    });

    let order: RazorpayOrderResponse;

    try {
        order = (await razorpay.orders.create({
            amount: Math.round(total * 100),
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            payment_capture: true,
        }) as unknown) as RazorpayOrderResponse;
    } catch (err) {
        console.error("Razorpay order creation failed:", err);
        return NextResponse.json(
            { success: false, error: "Failed to create Razorpay order" },
            { status: 500 },
        );
    }

    const securityHash = crypto
        .createHash("sha256")
        .update(JSON.stringify(cart) + "|" + total)
        .digest("hex");

    const orderData = {
        userName: name,
        userEmail: email,
        address,
        cart,
        subtotal,
        tax,
        deliveryFee,
        couponCode: validatedCouponCode,
        discountAmount: finalDiscount,
        total,
        razorpayOrderId: order.id,
        securityHash,
        paymentStatus: "pending",
        createdAt: new Date(),
    };

    try {
        const result = await db.collection("orders").insertOne(orderData);

        return NextResponse.json({
            success: true,
            order: { ...orderData, _id: result.insertedId },
            razorpayOrderId: order.id,
            amount: order.amount,
            securityHash,
        });
    } catch (err) {
        console.error("Mongo insert failed:", err);
        return NextResponse.json(
            { success: false, error: "Order insertion failed" },
            { status: 500 },
        );
    }
}
