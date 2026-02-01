import React, { useRef } from 'react';
import Image from 'next/image';
import LoadingSpinner from '@/components/icons/LoadingSpinner';
import LocationIcon from '@/components/icons/LocationIcon';
import EmailIcon from '@/components/icons/EmailIcon';
import { ProfileFormProps } from '@/types/user';

// Simple inline icons for a cleaner look
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);

const AddressIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
);

const GenderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
);

const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
    </svg>
);

const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
    </svg>
);

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

    const inputWrapperClass = "relative flex items-center";
    const iconClass = "absolute left-4 text-amber-500/50";
    const inputBaseClass = "w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-hidden transition-all duration-300 backdrop-blur-sm";
    const labelClass = "block text-sm font-medium text-amber-200/70 mb-2 ml-1";

    return (
        <form onSubmit={onSubmit} className="space-y-8">
            {/* Top Section: Avatar & Basic Info */}
            <div className="flex flex-col lg:flex-row gap-10 items-center lg:items-start">
                {/* Profile Image Section */}
                <div className="flex flex-col items-center">
                    <div className="group relative">
                        <div className="w-40 h-40 rounded-full p-1.5 bg-linear-to-tr from-primary to-amber-500 shadow-2xl transition-transform duration-500 hover:scale-105">
                            <div className="w-full h-full rounded-full overflow-hidden relative ring-4 ring-[#151515] bg-[#1a1108]">
                                <Image
                                    src={preview || userImage || '/profile.png'}
                                    alt="Profile picture"
                                    fill
                                    className="object-cover transition-opacity duration-300 group-hover:opacity-60"
                                    sizes="160px"
                                    priority
                                />

                                {/* Hover Overlay */}
                                <div
                                    onClick={() => !isFormDisabled && fileInputRef.current?.click()}
                                    className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer bg-black/40 backdrop-blur-[2px]"
                                >
                                    {uploadingImage ? (
                                        <LoadingSpinner size="md" color="text-white" />
                                    ) : (
                                        <>
                                            <CameraIcon />
                                            <span className="text-xs font-bold mt-1 uppercase tracking-tight">Change</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Status Indicating Ring (Saving) */}
                        {saving && (
                            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                        )}
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={onFileChange}
                        className="hidden"
                        disabled={isFormDisabled}
                    />

                    <div className="mt-4 text-center">
                        <p className="text-xs text-amber-500/60 font-medium tracking-wide">
                            RECOMENDED: 800x800px
                        </p>
                    </div>
                </div>

                {/* Form Fields Section */}
                <div className="flex-1 w-full space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name Field */}
                        <div className="space-y-1">
                            <label htmlFor="name" className={labelClass}>Full Name</label>
                            <div className={inputWrapperClass}>
                                <span className={iconClass}><UserIcon /></span>
                                <input
                                    {...register('name')}
                                    id="name"
                                    disabled={isFormDisabled}
                                    className={`${inputBaseClass} ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    placeholder="Enter your full name"
                                />
                            </div>
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1 ml-1 animate-fade-in">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Email Field (Read-only) */}
                        <div className="space-y-1">
                            <label htmlFor="email" className={labelClass}>Email Address</label>
                            <div className={inputWrapperClass}>
                                <span className={iconClass}><EmailIcon /></span>
                                <input
                                    {...register('email')}
                                    id="email"
                                    type="email"
                                    readOnly
                                    className={`${inputBaseClass} opacity-60 cursor-not-allowed bg-white/2 border-white/5`}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Phone Field */}
                        <div className="space-y-1">
                            <label htmlFor="phone" className={labelClass}>Phone Number</label>
                            <div className={inputWrapperClass}>
                                <span className={iconClass}><PhoneIcon /></span>
                                <input
                                    {...register('phone')}
                                    id="phone"
                                    type="tel"
                                    disabled={isFormDisabled}
                                    className={`${inputBaseClass} ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    placeholder="+1 234 567 8900"
                                />
                            </div>
                            {errors.phone && (
                                <p className="text-red-500 text-xs mt-1 ml-1 animate-fade-in">{errors.phone.message}</p>
                            )}
                        </div>

                        {/* Gender Selection */}
                        <div className="space-y-1">
                            <label htmlFor="gender" className={labelClass}>Gender</label>
                            <div className={inputWrapperClass}>
                                <span className={iconClass}><GenderIcon /></span>
                                <select
                                    {...register('gender')}
                                    id="gender"
                                    disabled={isFormDisabled}
                                    className={`${inputBaseClass} appearance-none ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <option value="" className="bg-[#151515]">Select Gender</option>
                                    <option value="male" className="bg-[#151515]">Male</option>
                                    <option value="female" className="bg-[#151515]">Female</option>
                                    <option value="other" className="bg-[#151515]">Other</option>
                                    <option value="prefer_not_to_say" className="bg-[#151515]">Prefer not to say</option>
                                </select>
                                <div className="absolute right-4 pointer-events-none text-white/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </div>
                            </div>
                            {errors.gender && (
                                <p className="text-red-500 text-xs mt-1 ml-1 animate-fade-in">{errors.gender.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Address Field */}
                    <div className="space-y-1">
                        <label htmlFor="address" className={labelClass}>Delivery Address</label>
                        <div className={inputWrapperClass}>
                            <span className={iconClass}><AddressIcon /></span>
                            <input
                                {...register('address')}
                                id="address"
                                disabled={isFormDisabled}
                                className={`${inputBaseClass} ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                placeholder="House No, Street, Landmark, City"
                            />
                        </div>
                        {errors.address && (
                            <p className="text-red-500 text-xs mt-1 ml-1 animate-fade-in">{errors.address.message}</p>
                        )}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={onFetchLocation}
                                disabled={isFetchingLocation || isFormDisabled}
                                className="text-[11px] font-bold uppercase tracking-wider text-primary hover:text-white flex gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 mt-2 items-center px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary border border-primary/20"
                            >
                                {isFetchingLocation ? (
                                    <LoadingSpinner size="xs" color="text-white" />
                                ) : (
                                    <LocationIcon />
                                )}
                                {isFetchingLocation ? "Detecting..." : "Auto-detect location"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-4">
                <button
                    type="submit"
                    disabled={isFormDisabled}
                    className={`flex-1 group relative overflow-hidden bg-primary hover:bg-primary-dark text-white py-4 rounded-2xl font-bold transition-all duration-300 cursor-pointer shadow-xl hover:shadow-primary/40 text-lg ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                        {saving ? (
                            <>
                                <LoadingSpinner size="sm" color="text-white" />
                                Updating Profile...
                            </>
                        ) : (
                            <>
                                <span>Save Changes</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                            </>
                        )}
                    </span>
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
            </div>
        </form>
    );
}
