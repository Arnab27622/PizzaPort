/**
 * This file defines the types for Sales Analytics and Reports.
 * These are used to show the Admin how the business is doing.
 */

/**
 * The different time periods a user can choose to view sales data.
 */
export const SALES_FILTERS = ['today', '7days', 'month', 'all-time'] as const;
export type FilterType = typeof SALES_FILTERS[number];

/**
 * Basic numbers (metrics) for the sales dashboard.
 */
export interface SalesMetrics {
    totalSales: number;    // Total money earned (₹)
    avgOrderValue: number; // Average cost per order (₹)
    totalOrders: number;   // Total number of orders placed
    totalGuests: number;   // Total unique customers
}

/**
 * Data for a single day used in a revenue chart.
 */
export interface DailyRevenue {
    _id: string;  // Internal database ID
    date: string; // The specific day (e.g., "2024-01-01")
    revenue: number; // How much money was made that day
}

/**
 * Information about a best-selling item.
 */
export interface TopProduct {
    name: string;      // Name of the pizza/item
    quantity: number;  // How many were sold
}

/**
 * The complete structure of a sales report.
 */
export interface SalesReport {
    metrics: SalesMetrics;       // General numbers
    dailyRevenue: DailyRevenue[]; // Data for the line chart
    topProducts: TopProduct[];    // Data for the "Best Sellers" list
}

