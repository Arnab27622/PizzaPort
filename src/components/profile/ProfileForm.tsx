/**
 * The form where users can see and edit their profile information.
 * It lets them change their Name, Address, Gender, and Profile Picture.
 */

import React, { useRef } from 'react';
import Image from 'next/image';
import LoadingSpinner from '@/components/icons/LoadingSpinner';
import LocationIcon from '@/components/icons/LocationIcon';
import { ProfileFormProps } from '@/types/user';

export default function ProfileForm({
    errors,
    register,
    userImage,
    preview,
    saving,
    uploadingImage,
    isFetchingLocation,
    onFileChange,
    onFetchLocation,
    onSubmit
}: ProfileFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isFormDisabled = saving || uploadingImage;
    const inputDisabledClass = 'opacity-50 cursor-not-allowed';

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
            {/* Profile Image & Form Fields Container */}
            <div className="flex flex-col items-center md:flex-row md:items-start gap-2 md:gap-4 heading-border">
                {/* Profile Image Section */}
                <div className="relative flex flex-col items-center">
                    <div className="rounded-full aspect-square w-32 h-32 overflow-hidden border-4 border-amber-700 relative bg-[#1a1108]">
                        <Image
                            src={preview || userImage || '/profile.png'}
                            alt="Profile picture"
                            fill
                            className="object-cover object-center"
                            sizes="128px"
                            priority
                        />
                        {(saving || uploadingImage) && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <LoadingSpinner size="sm" color="text-white" />
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => !isFormDisabled && fileInputRef.current?.click()}
                        disabled={isFormDisabled}
                        className={`mt-2 text-amber-300 font-semibold cursor-pointer hover:text-amber-400 disabled:opacity-50`}
                    >
                        {uploadingImage ? 'Uploading...' : 'Edit'}
                    </button>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={onFileChange}
                        className="hidden"
                        disabled={isFormDisabled}
                    />
                    <p className="text-amber-500 text-sm mt-1">
                        JPG, PNG or GIF (max 5MB)
                    </p>
                </div>

                {/* Form Fields Section */}
                <div className="flex-1 space-y-4 w-full">
                    {/* Name Field */}
                    <div>
                        <label htmlFor="name" className="block text-amber-200 mb-1">Full Name</label>
                        <input
                            {...register('name')}
                            id="name"
                            disabled={isFormDisabled}
                            className={`w-full p-3 bg-[#1a1108] border border-amber-800 rounded-xl text-amber-100 placeholder-amber-900/50 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden transition-all ${isFormDisabled ? inputDisabledClass : ''}`}
                            placeholder="Your name"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                        )}
                    </div>
                    {/* Email Field (Read-only) */}
                    <div>
                        <label htmlFor="email" className="block text-amber-200 mb-1">Email</label>
                        <input
                            {...register('email')}
                            id="email"
                            type="email"
                            readOnly
                            className={`w-full p-3 bg-[#1a1108] border border-amber-800 rounded-xl text-amber-100 cursor-not-allowed opacity-70`}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                    </div>
                    {/* Address Field */}
                    <div>
                        <label htmlFor="address" className="block text-amber-200 mb-1">Address</label>
                        <input
                            {...register('address')}
                            id="address"
                            disabled={isFormDisabled}
                            className={`w-full p-3 bg-[#1a1108] border border-amber-800 rounded-xl text-amber-100 placeholder-amber-900/50 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden transition-all ${isFormDisabled ? inputDisabledClass : ''}`}
                            placeholder="Enter your address"
                        />
                        {errors.address && (
                            <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                        )}
                        <button
                            type="button"
                            onClick={onFetchLocation}
                            disabled={isFetchingLocation || isFormDisabled}
                            className="text-sm text-amber-400 hover:text-white flex gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-1 items-center"
                        >
                            {isFetchingLocation ? (
                                <LoadingSpinner size="sm" color="text-amber-400" className="mr-1" />
                            ) : (
                                <LocationIcon />
                            )}
                            {isFetchingLocation ? "Fetching location..." : "Use Current Location"}
                        </button>
                    </div>
                    {/* Gender Selection */}
                    <div>
                        <label htmlFor="gender" className="block text-amber-200 mb-1">Gender</label>
                        <select
                            {...register('gender')}
                            id="gender"
                            disabled={isFormDisabled}
                            className={`w-full p-3 bg-[#1a1108] border border-amber-800 rounded-xl text-amber-100 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden transition-all ${isFormDisabled ? inputDisabledClass : ''}`}
                        >
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                        {errors.gender && (
                            <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
                        )}
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isFormDisabled}
                className={`w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-semibold transition-colors cursor-pointer shadow-lg hover:shadow-primary/20 transform hover:-translate-y-0.5 ${isFormDisabled ? inputDisabledClass : ''}`}
            >
                {saving ? (
                    <span className="flex items-center justify-center gap-2">
                        <LoadingSpinner size="sm" color="text-white" />
                        Saving...
                    </span>
                ) : 'Save Changes'}
            </button>
        </form>
    );
}
