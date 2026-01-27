import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongoConnect';
import { PAYMENT_STATUS } from '@/utils/constants';

/**
 * GET /api/menuitem/bestsellers
 * Fetches the top 6 best-selling menu items based on actual order data
 * 
 * This endpoint analyzes order history to determine which menu items
 * are most popular and returns their complete details for display
 * 
 * @returns {Promise<NextResponse>}
 *   Success: Array of top 6 menu items with full details
 *   Error: { error: string } with 500 status
 * 
 * @example
 * // Successful response structure
 * [
 *   {
 *     "_id": "...",
 *     "name": "Margherita Pizza",
 *     "description": "Classic pizza with tomato and mozzarella",
 *     "basePrice": 12.99,
 *     "imageUrl": "https://...",
 *     "sizeOptions": [...],
 *     "extraIngredients": [...],
 *     "totalSold": 45
 *   },
 *   ...
 * ]
 */
export async function GET() {
    try {
        // Establish database connection
        const client = await clientPromise;
        const db = client.db();
        const orders = db.collection("orders");
        const menuItems = db.collection("menuitems");

        /**
         * TOP PRODUCTS PIPELINE - Product Performance
         * Identifies best-selling products by quantity ordered
         * Only counts orders with successful payment status
         */
        const topProductsPipeline = [
            // Filter only successfully paid orders
            {
                $match: {
                    paymentStatus: {
                        $in: [
                            PAYMENT_STATUS.VERIFIED,
                            PAYMENT_STATUS.COMPLETED,
                            PAYMENT_STATUS.REFUND_INITIATED
                        ]
                    }
                }
            },
            { $unwind: "$cart" }, // Deconstruct cart array to analyze individual items
            {
                $group: {
                    _id: "$cart.name", // Group by product name
                    quantity: { $sum: 1 } // Count occurrences of each product
                }
            },
            { $sort: { quantity: -1 } }, // Sort by quantity descending (highest first)
            { $limit: 6 } // Return only top 6 products
        ];

        // Execute aggregation to get top product names
        const topProductsRaw = await orders.aggregate(topProductsPipeline).toArray();

        // If no orders exist, return random 6 items as fallback
        if (topProductsRaw.length === 0) {
            const allItems = await menuItems.find({}).limit(6).toArray();
            return NextResponse.json(allItems);
        }

        // Extract product names from aggregation results
        const topProductNames = topProductsRaw.map(p => p._id);

        // Fetch full menu item details for top products
        const bestSellers = await menuItems
            .find({ name: { $in: topProductNames } })
            .toArray();

        // Create a map of quantities for sorting
        const quantityMap = new Map(
            topProductsRaw.map(p => [p._id, p.quantity])
        );

        // Sort best sellers by their actual sales quantity and add totalSold field
        let sortedBestSellers = bestSellers
            .map(item => ({
                ...item,
                totalSold: quantityMap.get(item.name) || 0
            }))
            .sort((a, b) => b.totalSold - a.totalSold);

        // If we have fewer than 6 items, pad with additional menu items
        if (sortedBestSellers.length < 6) {
            const excludeIds = sortedBestSellers.map(item => item._id);
            const additionalItems = await menuItems
                .find({ _id: { $nin: excludeIds } })
                .limit(6 - sortedBestSellers.length)
                .toArray();

            // Add totalSold: 0 to additional items
            const paddedItems = additionalItems.map(item => ({
                ...item,
                totalSold: 0
            }));

            sortedBestSellers = [...sortedBestSellers, ...paddedItems];
        }

        // Ensure we only return 6 items
        const finalResult = sortedBestSellers.slice(0, 6);

        return NextResponse.json(finalResult);

    } catch (err) {
        /**
         * Error Handling
         * Handles aggregation errors, database connection issues, and data processing errors
         */
        console.error("Best sellers fetch error:", err);
        return NextResponse.json(
            { error: "Failed to fetch best sellers" },
            { status: 500 }
        );
    }
}
