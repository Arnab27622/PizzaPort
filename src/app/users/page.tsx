"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import Image from "next/image";
import { toast } from "react-toastify";
import LoadingSpinner from '@/components/icons/LoadingSpinner';
import ConfirmModal from '@/components/layout/ConfirmAdmin';
import { useIsAdmin } from '../hook/useAdmin';

/**
 * User Interface Definition
 * 
 * Comprehensive user profile structure for administrative user management
 * Contains user metadata, permissions, and account status information
 */
interface User {
    _id: string;                    // Unique MongoDB identifier
    name: string;                   // User's full name
    email: string;                  // Primary contact and login identifier
    address?: string;               // Optional delivery address
    gender?: string;                // Optional demographic information
    image?: string;                 // Optional profile picture URL
    admin: boolean;                 // Administrative privileges flag
    banned?: boolean;               // Account suspension status
    createdAt: string;              // Account registration timestamp
    updatedAt: string;              // Last activity timestamp
}

/**
 * Data Fetcher for SWR
 * 
 * Handles API requests for user data with error handling
 * Used by SWR for intelligent caching and background revalidation
 * 
 * @param {string} url - API endpoint to fetch data from
 * @returns {Promise<User[]>} Array of user objects
 */
const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch data");
    }
    return res.json();
};

/**
 * UsersPage Component
 * 
 * Comprehensive user management interface for restaurant administrators
 * Provides user search, filtering, and administrative privilege management
 * 
 * @component
 * @features
 * - Advanced user search by name and email
 * - Multi-criteria filtering (all users, admins, banned users)
 * - Flexible sorting (name, join date, activity)
 * - Administrative privilege management
 * - User account suspension/restoration
 * - Responsive design for all device sizes
 * 
 * @security
 * - Admin-only access enforcement through useIsAdmin hook
 * - Protected API endpoints with server-side validation
 * - Confirmation modals for destructive operations
 * - No sensitive data exposure in client-side rendering
 * - Automatic redirection for unauthorized users
 * 
 * @performance
 * - SWR caching with background revalidation for optimal performance
 * - Memoized calculations prevent unnecessary re-renders
 * - Efficient filtering and sorting with dependency optimization
 * - Optimized image loading with Next.js Image component
 * 
 * @user_experience
 * - Real-time search with instant filtering
 * - Intuitive user interface with clear visual hierarchy
 * - Confirmation dialogs for critical operations
 * - Comprehensive loading and processing states
 * - Accessible interface with proper ARIA labels
 * 
 * @example
 * // Renders complete user management dashboard for admins
 * <UsersPage />
 */
function UsersPage() {
    /**
     * Admin Access Control Hook
     * 
     * Validates user permissions before rendering user management features
     * Provides loading state during authentication verification
     */
    const { isAdmin, isLoading } = useIsAdmin();

    /**
     * User Data Fetching with SWR
     * 
     * Intelligent data fetching with caching and automatic revalidation
     * Provides real-time user data synchronization
     */
    const { data, error: swrError, isLoading: swrLoading, mutate } = useSWR<User[]>('/api/users', fetcher);
    const users = useMemo(() => Array.isArray(data) ? data : [], [data]);

    /**
     * Error Handling for Data Fetching
     * 
     * Displays a toast notification if the API request fails
     */
    useEffect(() => {
        if (swrError) {
            toast.error(swrError.message || "Failed to fetch users");
        }
    }, [swrError]);

    /**
     * Component State Management
     * 
     * @state selectedUser - Currently selected user for detail view/operations
     * @state confirmOpen - Controls ban/unban confirmation modal visibility
     * @state adminConfirmOpen - Controls admin privilege confirmation modal visibility
     * @state processing - Tracks ongoing operations to prevent duplicate requests
     * @state search - Search query for user filtering
     * @state filter - Current filter criteria (all, admins, banned)
     * @state sortKey - Current sorting criteria (name, createdAt, updatedAt)
     */
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [adminConfirmOpen, setAdminConfirmOpen] = useState(false);
    const [processing, setProcessing] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "admins" | "banned">("all");
    const [sortKey, setSortKey] = useState<"name" | "createdAt" | "updatedAt">("name");

    /**
     * Admin Access Enforcement Effect
     * 
     * Redirects non-admin users to home page automatically
     * Prevents unauthorized access to user management functionality
     */
    useEffect(() => {
        if (!isLoading && !isAdmin) {
            window.location.href = '/';
        }
    }, [isLoading, isAdmin]);

    /**
     * User Filtering and Sorting Hook
     * 
     * Applies search, filter, and sort criteria to user data
     * Memoized to prevent unnecessary recalculations on every render
     * 
     * @returns {User[]} Filtered and sorted array of users
     * 
     * @filter_logic
     * - Search: Case-insensitive match against name and email
     * - Filter: Matches against admin status or banned status
     * - Sort: Alphabetical by name or chronological by date fields
     */
    const filtered = useMemo(() => {
        return users
            .filter(u =>
                (u.name?.toLowerCase().includes(search.toLowerCase()) ||
                    u.email?.toLowerCase().includes(search.toLowerCase())) &&
                (filter === "all" ||
                    (filter === "admins" && u.admin) ||
                    (filter === "banned" && u.banned))
            )
            .sort((a, b) => {
                if (sortKey === "name") {
                    return a.name.localeCompare(b.name);
                }
                return new Date(b[sortKey]).getTime() - new Date(a[sortKey]).getTime();
            });
    }, [users, search, filter, sortKey]);

    /**
     * Admin Privilege Toggle Handler
     * 
     * Manages administrative privilege assignment and revocation
     * Implements confirmation workflow and comprehensive error handling
     * 
     * @async
     * @function
     */
    const handleAdminToggle = useCallback(async () => {
        if (!selectedUser) return;

        setProcessing('admin');
        try {
            const res = await fetch('/api/users/toggle-admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedUser._id,
                    admin: !selectedUser.admin
                }),
            });

            if (res.ok) {
                toast.success(`User is now ${!selectedUser.admin ? 'an admin' : 'no longer an admin'}`);
                mutate();
                setSelectedUser(prev => prev ? { ...prev, admin: !prev.admin } : null);
            } else {
                toast.error('Failed to update admin status');
            }
        } catch {
            toast.error('An error occurred');
        } finally {
            setProcessing(null);
            setAdminConfirmOpen(false);
        }
    }, [selectedUser, mutate]);

    /**
     * User Ban Toggle Handler
     * 
     * Manages user account suspension and restoration
     * Implements confirmation workflow and comprehensive error handling
     * 
     * @async
     * @function
     */
    const handleBanToggle = useCallback(async () => {
        if (!selectedUser) return;

        setProcessing('ban');
        try {
            const res = await fetch('/api/users/toggle-ban', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedUser._id,
                    banned: !selectedUser.banned
                }),
            });

            if (res.ok) {
                toast.success(`${!selectedUser.banned ? 'User is banned' : 'Ban has been revoked from user'}`);
                mutate();
                setSelectedUser(prev => prev ? { ...prev, banned: !prev.banned } : null);
            } else {
                toast.error('Failed to update banned status');
            }
        } catch {
            toast.error('An error occurred');
        } finally {
            setProcessing(null);
            setConfirmOpen(false);
        }
    }, [selectedUser, mutate]);

    /**
     * Date Formatter
     * 
     * Converts ISO timestamps to localized date format
     * Provides consistent date display throughout the interface
     * 
     * @function
     * @param {string} dateString - ISO format date string
     * @returns {string} Formatted date string
     */
    const formatDate = useCallback((dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB');
    }, []);

    /**
     * Combined Loading State
     * 
     * Displays loading spinner during authentication and initial data fetch
     * Provides consistent loading experience during critical operations
     */
    if (isLoading || swrLoading) {
        return (
            <div className="min-h-[80vh] p-6 mt-16 text-card">
                <h1 className="text-3xl font-bold heading-border underline mb-5">All Users</h1>
                <div className="flex flex-col items-center justify-center mt-32">
                    <LoadingSpinner size="lg" color="text-primary" />
                    <p className="mt-4 text-amber-300">Loading users...</p>
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
    if (!isAdmin) return null;

    /**
     * Main Component Render
     * 
     * Implements comprehensive user management interface with:
     * - Search, filter, and sort controls
     * - User list with essential information
     * - User detail modal with management actions
     * - Confirmation dialogs for critical operations
     * - Responsive layout for all device sizes
     */
    return (
        <div className="min-h-[80vh] p-6 mt-16 text-card">
            {/* Page Header */}
            <h1 className="text-3xl font-bold heading-border underline mb-5">All Users</h1>

            {/* Search, Filter, and Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4 items-start sm:items-center">
                {/* Search Input */}
                <input
                    type="text"
                    placeholder="Search by name or email"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="p-2 bg-[#2c1a0d] border border-amber-900 text-amber-100 rounded w-full sm:w-1/3"
                    aria-label="Search users"
                />
                {/* Filter Buttons */}
                <div className="flex gap-2">
                    {["all", "admins", "banned"].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as "all" | "admins" | "banned")}
                            className={`px-3 py-1 rounded font-semibold ${filter === f ? "bg-[#FF5500] text-white" : "border border-amber-900 bg-black/70 text-amber-100"
                                }`}
                            aria-pressed={filter === f}
                        >
                            {f === "all" ? "All" : f === "admins" ? "Admins" : "Banned"}
                        </button>
                    ))}
                </div>
                {/* Sort Dropdown */}
                <select
                    value={sortKey}
                    onChange={e => setSortKey(e.target.value as "name" | "createdAt" | "updatedAt")}
                    className="p-2 bg-[#2c1a0d] border border-amber-900 text-amber-100 rounded"
                    aria-label="Sort users by"
                >
                    <option value="name">Sort by name</option>
                    <option value="createdAt">Sort by join date</option>
                    <option value="updatedAt">Sort by activity</option>
                </select>
            </div>

            {/* User List Container */}
            <div className="bg-[#1a1108]/50 rounded-lg shadow p-4">
                {filtered.map(u => (
                    <div key={u._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-900 py-2">
                        {/* User Identity Section */}
                        <div className="flex items-center gap-3 min-w-0">
                            {/* Profile Image */}
                            {u.image && (
                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-700 shrink-0">
                                    <Image
                                        src={u.image}
                                        alt={u.name}
                                        width={40}
                                        height={40}
                                        className="object-cover w-full h-full"
                                        placeholder="blur"
                                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                                    />
                                </div>
                            )}
                            {/* User Information */}
                            <div className='truncate'>
                                <p className="font-semibold text-amber-100 truncate">{u.name}</p>
                                <p className="text-sm text-amber-300 truncate">{u.email}</p>
                            </div>
                        </div>

                        {/* User Actions Section */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-amber-300">
                            <span className="whitespace-nowrap">
                                Last Login: {formatDate(u.updatedAt)}
                            </span>
                            {/* View Details Button */}
                            <button
                                onClick={() => setSelectedUser(u)}
                                className="text-[#FF5500] hover:underline cursor-pointer whitespace-nowrap"
                                aria-label={`View details for ${u.name}`}
                            >
                                View
                            </button>
                        </div>
                    </div>
                ))}
                {/* Empty State */}
                {filtered.length === 0 && (
                    <p className="text-amber-300 text-center py-4">No users found.</p>
                )}
            </div>

            {/* User Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#3A3D40] text-card rounded-lg w-full max-w-sm sm:max-w-lg p-6 space-y-4 overflow-auto max-h-[90vh]">
                        {/* Modal Header */}
                        <h2 className="text-2xl font-semibold heading-border">{selectedUser.name}</h2>

                        {/* User Information Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-amber-100">
                            <div><strong>Email:</strong><p className="text-amber-300 break-all">{selectedUser.email}</p></div>
                            <div><strong>Address:</strong><p className="text-amber-300">{selectedUser.address || '-'}</p></div>
                            <div><strong>Gender:</strong><p className="text-amber-300">{selectedUser.gender || '-'}</p></div>
                            <div><strong>Registered:</strong><p className="text-amber-300">{formatDate(selectedUser.createdAt)}</p></div>
                        </div>

                        {/* Administrative Controls */}
                        <div className="flex items-center mt-4">
                            {/* Admin Privilege Toggle */}
                            <input
                                type="checkbox"
                                checked={selectedUser.admin}
                                onChange={() => setAdminConfirmOpen(true)}
                                className="mr-2 accent-[#FF5500] focus:ring-[#FF5500]"
                                id="admin-checkbox"
                                disabled={processing !== null}
                            />
                            <label htmlFor="admin-checkbox" className="text-amber-100 mr-2">Admin</label>

                            {/* Ban/Unban Button */}
                            <button
                                onClick={() => setConfirmOpen(true)}
                                disabled={processing !== null}
                                className={`px-4 py-2 rounded font-semibold ${selectedUser.banned
                                    ? 'border border-green-500 text-green-500 hover:bg-green-500/10'
                                    : 'bg-red-600 text-white hover:bg-red-700'
                                    }`}>
                                {processing === 'ban' ? 'Processing...' :
                                    selectedUser.banned ? 'Unban User' : 'Ban User'}
                            </button>
                        </div>

                        {/* Modal Actions */}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setSelectedUser(null)}
                                disabled={processing !== null}
                                className="px-3 py-2 rounded border border-[#CFB54F] hover:bg-[#CFB54F]/10 cursor-pointer text-amber-100">
                                Close
                            </button>
                        </div>
                    </div>

                    {/* Admin Privilege Confirmation Modal */}
                    <ConfirmModal
                        show={adminConfirmOpen}
                        message={`Are you sure you want to ${selectedUser?.admin ? 'revoke' : 'grant'} admin rights?`}
                        onClose={() => !processing && setAdminConfirmOpen(false)}
                        onConfirm={handleAdminToggle}
                    />

                    {/* User Ban Confirmation Modal */}
                    <ConfirmModal
                        show={confirmOpen}
                        message={`Are you sure you want to ${selectedUser.banned ? 'unban' : 'ban'} this user?`}
                        onClose={() => !processing && setConfirmOpen(false)}
                        onConfirm={handleBanToggle}
                    />
                </div>
            )}
        </div>
    );
}

export default UsersPage;