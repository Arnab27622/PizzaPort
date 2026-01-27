import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongoConnect';

/**
 * GET /api/analytics
 * Fetches comprehensive sales analytics and reporting data
 * 
 * This endpoint provides business intelligence data including:
 * - Key performance metrics (sales, orders, customer analytics)
 * - Daily revenue trends for time series analysis
 * - Top performing products by quantity sold
 * 
 * Supports date range filtering via query parameters for flexible reporting
 * 
 * @param {Request} request - The incoming request object
 * 
 * @queryParams {string} [from] - Start date for analytics filter (ISO string format)
 *            If not provided, defaults to beginning of time (all data)
 * 
 * @returns {Promise<NextResponse>}
 *   Success: Comprehensive analytics report object
 *   Error: { error: string } with 500 status
 * 
 * @throws {Error} Database connection errors, aggregation pipeline errors
 * 
 * @example
 * // Get all-time analytics
 * GET /api/analytics
 * 
 * @example
 * // Get analytics from specific date
 * GET /api/analytics?from=2024-01-01T00:00:00.000Z
 * 
 * @example
 * // Successful response structure
 * {
 *   "metrics": {
 *     "totalSales": 12500.50,
 *     "totalOrders": 150,
 *     "totalGuests": 45,
 *     "avgOrderValue": 83.34
 *   },
 *   "dailyRevenue": [
 *     { "date": "2024-01-15", "revenue": 450.75 },
 *     { "date": "2024-01-16", "revenue": 620.25 }
 *   ],
 *   "topProducts": [
 *     { "name": "Margherita Pizza", "quantity": 45 },
 *     { "name": "Pepperoni Pizza", "quantity": 38 }
 *   ]
 * }
 */
export async function GET(request: Request) {
    /**
     * Date Range Configuration
     * Parse 'from' query parameter or default to beginning of time (Unix epoch)
     * End date is always current time for real-time reporting
     */
    const url = new URL(request.url);
    const fromParam = url.searchParams.get("from");
    const fromDate = fromParam ? new Date(fromParam) : new Date(0); // Default to epoch if not provided
    const now = new Date(); // Current timestamp for upper bound

    try {
        // Establish database connection
        const client = await clientPromise;
        const db = client.db();
        const orders = db.collection("orders");

        /**
         * METRICS PIPELINE - Key Performance Indicators
         * Calculates overall business metrics for the selected date range
         */
        const validPaymentStatus = { $in: ["verified", "completed", "refund_initiated"] };

        /**
         * METRICS PIPELINE - Key Performance Indicators
         * Calculates overall business metrics for the selected date range
         */
        const metricsPipeline = [
            // Filter orders by date range and payment status
            {
                $match: {
                    createdAt: { $gte: fromDate, $lte: now },
                    paymentStatus: validPaymentStatus
                }
            },
            {
                $group: {
                    _id: null, // Single group for all documents
                    totalSales: { $sum: "$total" },           // Sum of all order totals
                    totalOrders: { $sum: 1 },                 // Count of all orders
                    totalGuests: {
                        // Count orders without userEmail as guest orders
                        $sum: { $cond: [{ $eq: ["$userEmail", null] }, 1, 0] }
                    },
                    avgOrderValue: { $avg: "$total" }         // Average order value
                }
            }
        ];

        /**
         * DAILY REVENUE PIPELINE - Time Series Analysis
         * Groups revenue by day for trend analysis and charting
         */
        const dailyPipeline = [
            // Filter orders by date range and payment status
            {
                $match: {
                    createdAt: { $gte: fromDate, $lte: now },
                    paymentStatus: validPaymentStatus
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },    // Extract year from date
                        month: { $month: "$createdAt" },  // Extract month from date
                        day: { $dayOfMonth: "$createdAt" } // Extract day from date
                    },
                    revenue: { $sum: "$total" } // Sum revenue per day
                }
            },
            { $sort: { "_id": 1 } } // Sort by date ascending for chronological order
        ];

        /**
         * TOP PRODUCTS PIPELINE - Product Performance
         * Identifies best-selling products by quantity ordered
         */
        const topProductsPipeline = [
            // Filter orders by date range and payment status
            {
                $match: {
                    createdAt: { $gte: fromDate, $lte: now },
                    paymentStatus: validPaymentStatus
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
            { $limit: 10 } // Return only top 10 products
        ];

        /**
         * Execute Aggregation Pipelines
         * Run all pipelines in sequence for comprehensive analytics
         */
        const [metrics] = await orders.aggregate(metricsPipeline).toArray();
        const dailyRevRaw = await orders.aggregate(dailyPipeline).toArray();
        const topProductsRaw = await orders.aggregate(topProductsPipeline).toArray();

        /**
         * Data Transformation
         * Convert MongoDB aggregation results to client-friendly formats
         */

        // Format daily revenue data with standardized date strings
        const dailyRevenue = dailyRevRaw.map(r => ({
            date: `${r._id.year}-${String(r._id.month).padStart(2, '0')}-${String(r._id.day).padStart(2, '0')}`,
            revenue: r.revenue
        }));

        // Format top products data with clear field names
        const topProducts = topProductsRaw.map(p => ({
            name: p._id,
            quantity: p.quantity
        }));

        /**
         * Compile Comprehensive Analytics Report
         * Structure all analytics data into a single response object
         */
        const report = {
            metrics: {
                totalSales: metrics?.totalSales ?? 0,         // Default to 0 if no data
                totalOrders: metrics?.totalOrders ?? 0,       // Default to 0 if no data
                totalGuests: metrics?.totalGuests ?? 0,       // Default to 0 if no data
                avgOrderValue: metrics?.avgOrderValue ?? 0    // Default to 0 if no data
            },
            dailyRevenue,    // Formatted daily revenue trends
            topProducts      // Top 10 products by sales quantity
        };

        // Return complete analytics report
        return NextResponse.json(report);

    } catch (err) {
        /**
         * Error Handling for Analytics Processing
         * Handles aggregation errors, database connection issues, and data processing errors
         */
        console.error("Analytics computation error:", err);
        return NextResponse.json(
            { error: "Failed computing report" },
            { status: 500 } // Internal Server Error
        );
    }
}