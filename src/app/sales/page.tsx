"use client";

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import LoadingSpinner from '@/components/icons/LoadingSpinner';
import { useIsAdmin } from '@/hooks/useAdmin';
import SalesCharts from '@/components/layout/SalesCharts';
import { SalesReport, FilterType, SALES_FILTERS } from '@/types/sales';

const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) throw new Error('Failed to fetch sales data');
    return res.json();
});

// Calculate the start date based on the selected filter (today, 7 days, month, all-time)
function computeFrom(filter: FilterType): Date {
    const now = new Date();
    if (filter === 'today') return new Date(now.setHours(0, 0, 0, 0));          // Start of current day
    if (filter === 'month') return new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month
    if (filter === 'all-time') return new Date(0);                              // Beginning of time (Epoch)
    return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);                      // 7 days ago from now
}

// Format numbers as Indian Rupees (₹)
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * This is the Admin Sales Report Page.
 * 
 * It shows charts and numbers about how the business is doing:
 * - Total Revenue (Today, This Month, All Time).
 * - Number of Orders.
 * - Best Selling pizzas.
 */
export default function SalesPage() {
    const router = useRouter();

    const { isAdmin, isLoading: isAdminLoading } = useIsAdmin();

    /**
     * Component State Management
     * 
     * @state filter - Currently selected time period for data analysis
     */
    const [filter, setFilter] = useState<FilterType>('7days');

    /**
     * Date Range Computation
     * 
     * Calculates ISO string for API query based on current filter
     * Memoized to prevent unnecessary recalculations on every render
     */
    const from = useMemo(() => computeFrom(filter).toISOString(), [filter]);

    // Fetch sales data from API
    const { data: report, isLoading: swrLoading, error } = useSWR<SalesReport>(
        isAdmin ? `/api/sales?from=${from}` : null,
        fetcher,
        {
            revalidateOnFocus: false,
            onError: (err) => console.error('Sales data fetch error:', err)
        }
    );

    // Redirect non-admins to home page
    useEffect(() => {
        if (!isAdminLoading && !isAdmin) {
            router.replace('/');
        }
    }, [isAdminLoading, isAdmin, router]);

    // Handle filter change (today, 7 days, month, all-time)
    const handleFilterChange = useCallback((newFilter: FilterType) => {
        setFilter(newFilter);
    }, []);

    /**
     * Filter Label Mapping
     * 
     * Provides user-friendly display names for filter options
     * Memoized for consistent reference across renders
     */
    const filterLabels: Record<FilterType, string> = useMemo(() => ({
        today: 'Today',
        '7days': 'Last 7 Days',
        month: 'This Month',
        'all-time': 'All Time'
    }), []);

    /**
     * Combined Loading State
     * 
     * Displays loading spinner during initial authentication and data fetch
     * Provides consistent loading experience during critical operations
     */
    if (isAdminLoading || swrLoading) {
        return (
            <div className="p-6 mt-16 text-card min-h-[80vh]">
                <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="text-3xl font-bold heading-border underline">Sales Analytics</h1>
                </header>
                <div className="flex flex-col items-center justify-center mt-32">
                    <LoadingSpinner size="lg" color="text-primary" />
                    <p className="mt-4 text-amber-300">Loading sales data...</p>
                </div>
            </div>
        );
    }

    /**
     * Access Denied State
     * 
     * Returns null during redirect for non-admin users
     * Prevents flash of unauthorized content
     */
    if (!isAdmin) {
        return null;
    }

    /**
     * Error State
     * 
     * Displays user-friendly error message with recovery option
     * Handles API failures and network errors gracefully
     */
    if (error) {
        return (
            <div className="p-6 mt-16 text-card">
                <h1 className="text-3xl font-bold heading-border underline mb-6">Sales Analytics</h1>
                <div className="bg-red-900/30 border border-red-800 rounded-lg p-6 text-center">
                    <h2 className="text-xl text-red-300 mb-2">Failed to Load Sales Data</h2>
                    <p className="text-amber-200 mb-4">{error.message || 'Please try again later'}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-primary text-white px-4 py-2 rounded hover:bg-amber-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    /**
     * Empty Data State
     * 
     * Handles cases where no sales data exists for selected period
     * Provides clear messaging for empty result sets
     */
    if (!report) {
        return (
            <div className="p-6 mt-16 text-card">
                <h1 className="text-3xl font-bold heading-border underline mb-6">Sales Analytics</h1>
                <div className="text-center py-12 text-amber-300">
                    No sales data available for the selected period.
                </div>
            </div>
        );
    }

    /**
     * Main Component Render
     * 
     * Implements comprehensive sales analytics dashboard with:
     * - Time period filtering controls
     * - Key performance indicator metrics
     * - Interactive data visualizations
     * - Responsive grid layouts
     */
    return (
        <div className="p-6 mt-16 text-card">
            {/* Dashboard Header with Filter Controls */}
            <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold heading-border underline">Sales Analytics</h1>
                <div className="flex flex-wrap gap-2">
                    {SALES_FILTERS.map((f: FilterType) => (
                        <button
                            key={f}
                            onClick={() => handleFilterChange(f)}
                            disabled={swrLoading}
                            className={`px-3 py-1 cursor-pointer rounded transition-colors ${filter === f
                                ? 'bg-[#FF5500] text-white'
                                : 'bg-black/60 border border-amber-900 text-amber-100 hover:bg-amber-900/50'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            aria-pressed={filter === f}
                            aria-label={`Show data for ${filterLabels[f]}`}
                        >
                            {filterLabels[f]}
                        </button>
                    ))}
                </div>
            </header>

            {/* Key Performance Indicator Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Total Sales Metric Card */}
                <div className="bg-linear-to-br from-[#151515] to-[#070502] rounded-xl p-4 border border-amber-800">
                    <span className="block text-2xl font-semibold text-amber-100">{formatCurrency(report.metrics.totalSales)}</span>
                    <span className="text-sm text-amber-300">Total Sales</span>
                </div>
                {/* Average Order Value Metric Card */}
                <div className="bg-linear-to-br from-[#151515] to-[#070502] rounded-xl p-4 border border-amber-800">
                    <span className="block text-2xl font-semibold text-amber-100">{formatCurrency(report.metrics.avgOrderValue)}</span>
                    <span className="text-sm text-amber-300">Avg Order Value</span>
                </div>
                {/* Total Orders Metric Card */}
                <div className="bg-linear-to-br from-[#151515] to-[#070502] rounded-xl p-4 border border-amber-800">
                    <span className="block text-2xl font-semibold text-amber-100">{report.metrics.totalOrders}</span>
                    <span className="text-sm text-amber-300">Total Orders</span>
                </div>
                {/* Total Guests Metric Card */}
                <div className="bg-linear-to-br from-[#151515] to-[#070502] rounded-xl p-4 border border-amber-800">
                    <span className="block text-2xl font-semibold text-amber-100">{report.metrics.totalGuests}</span>
                    <span className="text-sm text-amber-300">Total Guests</span>
                </div>
            </div>

            {/* Interactive Charts and Data Visualizations */}
            <SalesCharts report={report} />
        </div>
    );
}