import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoConnect";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db();

        // Fetch all active coupons
        const coupons = await db.collection("coupons")
            .find({ isActive: true })
            .sort({ createdAt: -1 })
            .toArray();

        // For each coupon, calculate user's usage
        const couponsWithUsage = await Promise.all(coupons.map(async (coupon) => {
            const userUsageCount = await db.collection("orders").countDocuments({
                userEmail: session.user?.email,
                couponCode: coupon.code,
                paymentStatus: { $in: ["verified", "completed"] }
            });

            return {
                ...coupon,
                _id: coupon._id.toString(),
                userUsageCount,
                remainingUses: coupon.usageLimit ? Math.max(0, coupon.usageLimit - userUsageCount) : null
            };
        }));

        return NextResponse.json(couponsWithUsage);

    } catch (error) {
        console.error("Error fetching user coupons:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
