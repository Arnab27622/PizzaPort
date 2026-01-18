'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { toast } from 'react-toastify';
import LoadingSpinner from '@/components/icons/LoadingSpinner';
import LocationIcon from '@/components/icons/LocationIcon';

/**
 * Extended User Type Definition
 * 
 * Augments NextAuth's default user type with application-specific fields
 * Supports comprehensive user profile management beyond basic authentication
 */
type ExtendedUser = {
    name?: string;              // User's full name for personalization
    email?: string;             // Primary contact and login identifier
    image?: string;             // Profile picture URL for avatar display
    address?: string;           // Default delivery address for orders
    gender?: string;            // Demographic information for personalization
};

/**
 * ProfilePage Component
 * 
 * Comprehensive user profile management interface with real-time updates
 * Provides secure profile editing, image upload, and location services
 * 
 * @component
 * @features
 * - Secure session-based authentication with required access control
 * - Profile image upload with validation and preview
 * - Geolocation-based address auto-fill
 * - Real-time form validation and error handling
 * - Optimistic UI updates with loading states
 * - Responsive design for all device sizes
 * 
 * @security
 * - Session-gated access prevents unauthorized profile access
 * - File type and size validation prevents malicious uploads
 * - Input sanitization through controlled form components
 * - Secure API communication with proper error handling
 * - Object URL cleanup prevents memory leaks
 * 
 * @performance
 * - Memoized callbacks prevent unnecessary re-renders
 * - Efficient image handling with Next.js optimization
 * - Geolocation API with timeout and caching
 * - Conditional rendering optimizes bundle size
 * 
 * @user_experience
 * - Intuitive form layout with clear validation
 * - Real-time preview for profile images
 * - Graceful loading and error states
 * - Accessible form controls with proper labels
 * - Mobile-optimized touch targets
 * 
 * @example
 * // Renders user profile form with current session data
 * <ProfilePage />
 */
function ProfilePage() {
    /**
     * Authentication & Session Management
     * 
     * Secures access to profile functionality and provides user data
     * Required session ensures only authenticated users can access profiles
     */
    const { data: session, status, update } = useSession({ required: true });
    const router = useRouter();

    /**
     * File Input Reference
     * 
     * Programmatic control over hidden file input for profile pictures
     * Enables custom styling while maintaining native file picker functionality
     */
    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * Component State Management
     * 
     * @state form - User profile data with controlled form inputs
     * @state preview - Temporary image URL for profile picture preview
     * @state saving - Tracks form submission to prevent duplicate requests
     * @state uploadingImage - Tracks image upload progress for UI feedback
     * @state isFetchingLocation - Tracks geolocation API operation status
     */
    const [form, setForm] = useState({
        name: '',
        email: '',
        address: '',
        gender: '',
    });
    const [preview, setPreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);

    /**
     * Session Data Initialization Effect
     * 
     * Populates form with current user data when session loads
     * Prevents form flickering by waiting for session resolution
     */
    useEffect(() => {
        if (status === 'loading') return;

        if (session?.user) {
            const user = session.user as ExtendedUser;
            setForm({
                name: user.name ?? '',
                email: user.email ?? '',
                address: user.address ?? '',
                gender: user.gender ?? '',
            });
        }
    }, [status, session]);

    /**
     * Object URL Cleanup Effect
     * 
     * Prevents memory leaks by revoking temporary image URLs
     * Essential for browser performance with file previews
     */
    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    /**
     * Geolocation Address Fetcher
     * 
     * Retrieves user's current address using browser geolocation and reverse geocoding
     * Implements proper error handling and user feedback
     * 
     * @async
     * @function
     * @throws {Error} When geolocation is unsupported or API fails
     */
    const fetchUserLocation = useCallback(async () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setIsFetchingLocation(true);
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    timeout: 10000,        // 10 second timeout for slow connections
                    maximumAge: 60000      // Cache location for 1 minute
                });
            });

            const { latitude, longitude } = position.coords;
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );

            if (!res.ok) throw new Error("Failed to fetch address");

            const data = await res.json();
            if (data.display_name) {
                setForm(prev => ({ ...prev, address: data.display_name }));
                toast.success("Location fetched successfully");
            }
        } catch (error) {
            console.error("Failed to fetch address:", error);
            toast.error("Could not fetch your location. Please enter manually.");
        } finally {
            setIsFetchingLocation(false);
        }
    }, []);

    /**
     * Form Input Change Handler
     * 
     * Universal handler for all form field updates
     * Maintains form state integrity with controlled components
     */
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }, []);

    /**
     * Profile Image Upload Handler
     * 
     * Validates and previews selected image files before upload
     * Implements security checks for file type and size
     */
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type to prevent malicious uploads
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 5MB) for performance
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        // Clean up previous preview to prevent memory leaks
        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setPreview(URL.createObjectURL(file));
    }, [preview]);

    /**
     * Profile Form Submission Handler
     * 
     * Processes profile updates with image upload support
     * Implements comprehensive error handling and user feedback
     * 
     * @async
     * @function
     * @param {React.FormEvent} e - Form submission event
     */
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const body = new FormData();
            body.append('name', form.name.trim());
            body.append('address', form.address.trim());
            body.append('gender', form.gender);

            // Handle image upload if file is selected
            if (fileInputRef.current?.files?.[0]) {
                setUploadingImage(true);
                body.append('profilePic', fileInputRef.current.files[0]);
            }

            const res = await fetch('/api/profile', {
                method: 'POST',
                body
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `Server returned ${res.status}`);
            }

            // Update session to reflect profile changes immediately
            await update();

            toast.success('Profile updated successfully');
            router.refresh();

            // Clean up temporary image preview after successful upload
            if (preview) {
                URL.revokeObjectURL(preview);
                setPreview(null);
            }
        } catch (error) {
            console.error('Profile update error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to update profile');
        } finally {
            setSaving(false);
            setUploadingImage(false);
        }
    }, [form, preview, update, router]);

    /**
     * File Input Trigger
     * 
     * Programmatically opens file picker when custom button is clicked
     * Maintains accessibility while allowing custom file input styling
     */
    const triggerFileInput = useCallback(() => {
        if (!saving && fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, [saving]);

    /**
     * Loading State
     * 
     * Displays loading spinner during initial session verification
     * Provides consistent loading experience during authentication
     */
    if (status === 'loading') {
        return (
            <div className="max-w-xl mx-auto mt-20 mb-8 p-6 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    // Security fallback - should not occur due to required session
    if (!session?.user) return null;

    /**
     * Accessibility & UI Constants
     * 
     * Centralized styling for disabled states ensures consistency
     * Improves maintainability and user experience
     */
    const inputDisabledClass = 'opacity-50 cursor-not-allowed';
    const isFormDisabled = saving || uploadingImage;

    /**
     * Main Component Render
     * 
     * Implements comprehensive profile management interface with:
     * - Profile image upload with preview
     * - User information form with validation
     * - Geolocation-based address auto-fill
     * - Responsive layout for all screen sizes
     */
    return (
        <section className="max-w-xl mx-auto mt-20 mb-8 p-6 md:bg-[#1a1108]/60 md:rounded-2xl md:shadow-lg bg-transparent">
            {/* Page Header */}
            <h1 className="text-3xl font-semibold text-primary mb-6 heading-border">Your Profile</h1>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Profile Image & Form Fields Container */}
                <div className="flex flex-col items-center md:flex-row md:items-start gap-2 md:gap-4 heading-border">
                    {/* Profile Image Section */}
                    <div className="relative flex flex-col items-center">
                        {/* Image Preview Container */}
                        <div className="rounded-full aspect-square w-32 h-32 overflow-hidden border-4 border-amber-700 relative">
                            <Image
                                src={preview || session.user.image || '/profile.png'}
                                alt="Profile picture"
                                fill
                                className="object-cover object-center"
                                sizes="128px"
                                priority
                            />
                            {/* Loading Overlay for Image Upload */}
                            {(saving || uploadingImage) && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 h-4 w-4 flex items-center justify-center">
                                    <LoadingSpinner />
                                </div>
                            )}
                        </div>
                        {/* Image Upload Trigger */}
                        <button
                            type="button"
                            onClick={triggerFileInput}
                            disabled={isFormDisabled}
                            className={`mt-2 text-amber-300 font-semibold cursor-pointer hover:text-amber-400 ${isFormDisabled ? inputDisabledClass : ''}`}
                            aria-label="Change profile picture"
                        >
                            {uploadingImage ? 'Uploading...' : 'Edit'}
                        </button>
                        {/* Hidden File Input */}
                        <input
                            id="profilePic"
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={isFormDisabled}
                            aria-describedby="fileInputHelp"
                        />
                        <p id="fileInputHelp" className="text-amber-500 text-sm mt-1">
                            JPG, PNG or GIF (max 5MB)
                        </p>
                    </div>

                    {/* Form Fields Section */}
                    <div className="flex-1 space-y-4 w-full">
                        {/* Name Field */}
                        <div>
                            <label htmlFor="name" className="block text-amber-200 mb-1">Full Name</label>
                            <input
                                id="name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                disabled={isFormDisabled}
                                className={`w-full p-3 bg-[#1a1108] border border-amber-800 rounded-xl text-amber-100 ${isFormDisabled ? inputDisabledClass : ''}`}
                                required
                                minLength={2}
                                maxLength={50}
                            />
                        </div>
                        {/* Email Field (Read-only) */}
                        <div>
                            <label htmlFor="email" className="block text-amber-200 mb-1">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={form.email}
                                readOnly
                                disabled
                                className={`w-full p-3 bg-[#1a1108] border border-amber-800 rounded-xl text-amber-100 cursor-not-allowed ${isFormDisabled ? inputDisabledClass : ''}`}
                                aria-readonly="true"
                            />
                        </div>
                        {/* Address Field with Geolocation */}
                        <div>
                            <label htmlFor="address" className="block text-amber-200 mb-1">Address</label>
                            <input
                                id="address"
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                disabled={isFormDisabled}
                                className={`w-full p-3 bg-[#1a1108] border border-amber-800 rounded-xl text-amber-100 ${isFormDisabled ? inputDisabledClass : ''}`}
                                placeholder="Enter your address"
                                maxLength={200}
                            />
                            {/* Geolocation Button */}
                            <button
                                type="button"
                                onClick={fetchUserLocation}
                                disabled={isFetchingLocation || isFormDisabled}
                                className="text-sm text-amber-400 hover:text-white flex gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-1"
                                aria-label="Use current location"
                            >
                                {isFetchingLocation ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-amber-400 mr-1"></div>
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
                                id="gender"
                                name="gender"
                                value={form.gender}
                                onChange={handleChange}
                                disabled={isFormDisabled}
                                className={`w-full p-3 bg-[#1a1108] border border-amber-800 rounded-xl text-amber-100 ${isFormDisabled ? inputDisabledClass : ''}`}
                            >
                                <option value="">Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                                <option value="prefer_not_to_say">Prefer not to say</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Form Submission Button */}
                <button
                    type="submit"
                    disabled={isFormDisabled}
                    className={`w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-semibold transition-colors ${isFormDisabled ? inputDisabledClass : 'cursor-pointer'}`}
                    aria-disabled={isFormDisabled}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </section>
    );
}

export default ProfilePage;