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
