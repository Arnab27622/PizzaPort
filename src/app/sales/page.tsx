"use client";

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import LoadingSpinner from '@/components/icons/LoadingSpinner';
import { useIsAdmin } from '../hook/useAdmin';
import SalesCharts from '@/components/layout/SalesCharts';
import { SalesReport } from '../../../types/sales';

/**
 * Data Fetcher for SWR
 * 
 * Handles API requests for sales data with comprehensive error handling
 * Used by SWR for intelligent caching and background revalidation
 * 
 * @param {string} url - API endpoint with query parameters
 * @returns {Promise<SalesReport>} Parsed sales report data
 * @throws {Error} When API response is not OK or network fails
 */
const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) throw new Error('Failed to fetch sales data');
    return res.json();
});

/**
 * Time Filter Configuration
 * 
 * Defines available time periods for sales data analysis
 * Ensures type safety for filter operations throughout the component
 */
const FILTERS = ['today', '7days', 'month'] as const;
type FilterType = typeof FILTERS[number];

/**
 * Date Range Calculator
 * 
 * Computes start date for sales data based on selected filter
 * Provides consistent date calculations across the application
 * 
 * @param {FilterType} filter - Selected time period filter
 * @returns {Date} Start date for data query
 */
function computeFrom(filter: FilterType): Date {
    const now = new Date();
    if (filter === 'today') return new Date(now.setHours(0, 0, 0, 0));          // Start of current day
    if (filter === 'month') return new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month
    return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);                      // 7 days ago from now
}

/**
 * Currency Formatter for INR
 * 
 * Formats numerical amounts to Indian Rupees display format
 * Supports proper localization and consistent currency display
 * 
 * @param {number} amount - Numerical amount to format
 * @returns {string} Locale-formatted currency string
 */
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * SalesPage Component
 * 
 * Comprehensive sales analytics dashboard for restaurant administrators
 * Provides real-time business intelligence with visual data representations
 * 
 * @component
 * @features
 * - Multi-period sales analysis (today, 7 days, month)
 * - Key performance indicator metrics display
 * - Interactive charts and data visualizations
 * - Real-time data updates with intelligent caching
 * - Responsive design for all device sizes
 * - Role-based access control
 * 
 * @security
 * - Admin-only access enforcement through useIsAdmin hook
 * - Protected API endpoints with server-side validation
 * - No sensitive data exposure in client-side rendering
 * - Automatic redirection for unauthorized users
 * 
 * @performance
 * - SWR caching with background revalidation for optimal performance
 * - Memoized calculations prevent unnecessary re-renders
 * - Efficient date computations with proper dependency management
 * - Conditional data fetching based on authentication status
 * 
 * @user_experience
 * - Intuitive time period filtering with visual feedback
 * - Comprehensive loading and error states
 * - Accessible interface with proper ARIA labels
 * - Clear visual hierarchy with metric cards and charts
 * - Responsive grid layouts for all screen sizes
 * 
 * @example
 * // Renders complete sales analytics dashboard for admins
 * <SalesPage />
 */
export default function SalesPage() {
    const router = useRouter();

    /**
     * Admin Access Control Hook
     * 
     * Validates user permissions before rendering sales analytics
     * Provides loading state during authentication verification
     */
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

    /**
     * Sales Data Fetching with SWR
     * 
     * Intelligent data fetching with caching and error handling
     * Conditionally fetches data only when admin access is confirmed
     * 
     * @config revalidateOnFocus:false - Prevents disruptive refetching
     * @config onError - Comprehensive error logging for debugging
     */
    const { data: report, isLoading: swrLoading, error } = useSWR<SalesReport>(
        isAdmin ? `/api/sales?from=${from}` : null,
        fetcher,
        {
            revalidateOnFocus: false,
            onError: (err) => console.error('Sales data fetch error:', err)
        }
    );

    /**
     * Admin Access Enforcement Effect
     * 
     * Redirects non-admin users to home page automatically
     * Prevents unauthorized access to sensitive sales data
     */
    useEffect(() => {
        if (!isAdminLoading && !isAdmin) {
            router.replace('/');
        }
    }, [isAdminLoading, isAdmin, router]);

    /**
     * Filter Change Handler
     * 
     * Updates time period filter with callback optimization
     * Triggers automatic data refetch through SWR dependency
     */
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
        month: 'This Month'
    }), []);

    /**
     * Combined Loading State
     * 
     * Displays loading spinner during initial authentication and data fetch
     * Provides consistent loading experience during critical operations
     */
    if (isAdminLoading || swrLoading) {
        return (
            <>
                <h1 className="text-3xl text-card p-6 pb-0 mt-20 font-bold heading-border">Sales Analytics</h1>
                <div className="max-w-xl mx-auto mb-8 flex justify-center">
                    <LoadingSpinner />
                </div>
            </>
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
            <div className="p-6 mt-20 text-card">
                <h1 className="text-3xl font-bold heading-border mb-6">Sales Analytics</h1>
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
            <div className="p-6 mt-20 text-card">
                <h1 className="text-3xl font-bold heading-border mb-6">Sales Analytics</h1>
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
        <div className="p-6 mt-20 text-card">
            {/* Dashboard Header with Filter Controls */}
            <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold heading-border">Sales Analytics</h1>
                <div className="flex flex-wrap gap-2">
                    {FILTERS.map(f => (
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
                <div className="bg-gradient-to-br from-[#2c1a0d] to-[#1a1108] rounded-xl p-4 border border-amber-800">
                    <span className="block text-2xl font-semibold text-amber-100">{formatCurrency(report.metrics.totalSales)}</span>
                    <span className="text-sm text-amber-300">Total Sales</span>
                </div>
                {/* Average Order Value Metric Card */}
                <div className="bg-gradient-to-br from-[#2c1a0d] to-[#1a1108] rounded-xl p-4 border border-amber-800">
                    <span className="block text-2xl font-semibold text-amber-100">{formatCurrency(report.metrics.avgOrderValue)}</span>
                    <span className="text-sm text-amber-300">Avg Order Value</span>
                </div>
                {/* Total Orders Metric Card */}
                <div className="bg-gradient-to-br from-[#2c1a0d] to-[#1a1108] rounded-xl p-4 border border-amber-800">
                    <span className="block text-2xl font-semibold text-amber-100">{report.metrics.totalOrders}</span>
                    <span className="text-sm text-amber-300">Total Orders</span>
                </div>
                {/* Total Guests Metric Card */}
                <div className="bg-gradient-to-br from-[#2c1a0d] to-[#1a1108] rounded-xl p-4 border border-amber-800">
                    <span className="block text-2xl font-semibold text-amber-100">{report.metrics.totalGuests}</span>
                    <span className="text-sm text-amber-300">Total Guests</span>
                </div>
            </div>

            {/* Interactive Charts and Data Visualizations */}
            <SalesCharts report={report} />
        </div>
    );
}