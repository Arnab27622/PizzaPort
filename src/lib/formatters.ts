/**
 * This file contains helper functions to format data (like money and dates)
 * so they look nice and consistent throughout the website.
 */

/**
 * Formats a number into Indian Rupee (INR) currency format.
 * Example: 500 -> ₹500
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * Formats a date string or object into a long, readable format.
 * Example: "Monday, 1 January, 2024 at 10:00 AM"
 */
export const formatDate = (dateString: string | Date): string => {
    return new Date(dateString).toLocaleString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Formats a date string or object into a short format.
 * Example: "1 Jan 2024"
 */
export const formatShortDate = (dateString: string | Date): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

