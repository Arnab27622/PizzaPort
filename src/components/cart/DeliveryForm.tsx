/**
 * This component displays the form where the user confirms their delivery details.
 * It shows their name and email (which cannot be changed here) and allows them
 * to enter or auto-detect their delivery address.
 */

import React from 'react';
import LocationIcon from '@/components/icons/LocationIcon';
import LoadingSpinner from '@/components/icons/LoadingSpinner';
import { DeliveryFormProps } from '@/types/cart';

export default function DeliveryForm({
    userName,
    userEmail,
    register,
    errors,
    onFetchLocation,
    isFetchingLocation
}: DeliveryFormProps) {
    return (
        <div className="bg-[#151515] border border-amber-900 p-6 rounded-lg shadow-lg space-y-6">
            <h2 className="text-2xl font-bold text-amber-50">Delivery Details</h2>

            {/* Name Field (Read-only) */}
            <div>
                <label className="block text-sm mb-1 text-amber-200">Name</label>
                <input
                    type="text"
                    value={userName}
                    readOnly
                    className="w-full px-4 py-2 rounded bg-[#2e2e2e] border border-amber-800 text-gray-300 cursor-not-allowed"
                    aria-readonly="true"
                    title="You can't change your name here"
                />
            </div>

            {/* Email Field (Read-only) */}
            <div>
                <label className="block text-sm mb-1 text-amber-200">Email</label>
                <input
                    type="email"
                    value={userEmail}
                    readOnly
                    className="w-full px-4 py-2 rounded bg-[#2e2e2e] border border-amber-800 text-gray-300 cursor-not-allowed"
                    aria-readonly="true"
                    title="You can't change your email here"
                />
            </div>

            {/* Address Input with Geolocation */}
            <div className="space-y-2">
                <label className="block text-sm mb-1 text-amber-200">Delivery Address</label>
                <textarea
                    {...register('address')}
                    className="w-full px-4 py-2 rounded bg-[#2e2e2e] border border-amber-800 text-white resize-none focus:border-primary focus:ring-1 focus:ring-primary outline-hidden transition-all"
                    rows={3}
                    placeholder="Enter your delivery address"
                />
                {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                )}
                <button
                    onClick={onFetchLocation}
                    disabled={isFetchingLocation}
                    className="text-sm text-amber-400 hover:text-white flex gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors items-center"
                    aria-label="Use current location"
                    type="button"
                >
                    {isFetchingLocation ? (
                        <LoadingSpinner size="sm" color="text-amber-400" className="mr-1" />
                    ) : (
                        <LocationIcon />
                    )}
                    {isFetchingLocation ? "Fetching location..." : "Use Current Location"}
                </button>
            </div>
        </div>
    );
}

