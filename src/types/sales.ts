export const SALES_FILTERS = ['today', '7days', 'month', 'all-time'] as const;
export type FilterType = typeof SALES_FILTERS[number];

export interface SalesMetrics {
    totalSales: number;
    avgOrderValue: number;
    totalOrders: number;
    totalGuests: number;
}

export interface DailyRevenue {
    _id: string;
    date: string;
    revenue: number;
}

export interface TopProduct {
    name: string;
    quantity: number;
}

export interface SalesReport {
    metrics: SalesMetrics;
    dailyRevenue: DailyRevenue[];
    topProducts: TopProduct[];
}
