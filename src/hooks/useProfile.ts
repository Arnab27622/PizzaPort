/**
 * This custom hook handles everything for the User Profile page.
 * It manages the form for updating names, addresses, and profile pictures.
 * It also has a cool feature to fetch the user's current location using GPS.
 */

import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ExtendedUser, ProfileFormState } from '@/types/user';

/**
 * Validation rules for the Profile Form.
 * We use "Zod" to make sure the user enters valid information.
 */
const ProfileSchema = z.object({
    name: z.string().min(1, 'Full Name is required').max(50, 'Name is too long'),
    email: z.string().email('Invalid email address'),
    phone: z.string().refine(val => val === '' || (val.length >= 10 && val.length <= 15), {
        message: 'Phone number must be between 10 and 15 digits',
    }),
    address: z.string().min(1, 'Address is required').max(200, 'Address is too long'),
    gender: z.string().min(1, 'Please select a gender'),
});

/**
 * useProfile Hook
 */
export function useProfile() {
    // 1. Get the current session (user info) and the update function
    const { data: session, status, update } = useSession({ required: true });
    const router = useRouter();

    // 2. Set up the form handling with react-hook-form
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting: saving }
    } = useForm<ProfileFormState>({
        resolver: zodResolver(ProfileSchema),
        mode: 'onChange'
    });

    const [preview, setPreview] = useState<string | null>(null); // Image preview URL
    const [uploadingImage, setUploadingImage] = useState(false); // Spinner for image upload
    const [isFetchingLocation, setIsFetchingLocation] = useState(false); // Spinner for GPS
    const [selectedFile, setSelectedFile] = useState<File | null>(null); // Actual file to upload

    const formValues = watch();

    /**
     * When the user's session is loaded, fill the form with their current data.
     */
    useEffect(() => {
        if (status === 'authenticated' && session?.user) {
            const user = session.user as ExtendedUser;
            reset({
                name: user.name ?? '',
                email: user.email ?? '',
                phone: user.phone ?? '',
                address: user.address ?? '',
                gender: user.gender ?? '',
            });
        }
    }, [status, session, reset]);

    /**
     * Clean up the temporary preview URL to save memory.
     */
    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    /**
     * Called when the user picks a new profile picture.
     */
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic safety checks
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
    }, [preview]);

    /**
     * USES GPS to find the user's address!
     */
    const fetchUserLocation = useCallback(async () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setIsFetchingLocation(true);
        try {
            // Get coordinates (Latitude/Longitude)
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    timeout: 10000,
                    maximumAge: 60000
                });
            });

            const { latitude, longitude } = position.coords;

            // Convert coordinates to a real address using a free API (Nominatim)
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );

            if (!res.ok) throw new Error("Failed to fetch address");

            const data = await res.json();
            if (data.display_name) {
                // Update the form field automatically
                setValue('address', data.display_name, { shouldValidate: true });
                toast.success("Location fetched successfully");
            }
        } catch (error) {
            console.error("Failed to fetch address:", error);
            toast.error("Could not fetch your location. Please enter manually.");
        } finally {
            setIsFetchingLocation(false);
        }
    }, [setValue]);

    /**
     * Submits the updated profile to our server.
     */
    const onSubmit = useCallback(async (data: ProfileFormState) => {
        try {
            const body = new FormData();
            body.append('name', data.name.trim());
            body.append('address', data.address.trim());
            body.append('gender', data.gender);
            body.append('phone', data.phone || '');

            if (selectedFile) {
                setUploadingImage(true);
                body.append('profilePic', selectedFile);
            }

            const res = await fetch('/api/profile', {
                method: 'POST',
                body
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `Server returned ${res.status}`);
            }

            // Tell NextAuth to refresh the user session data
            await update();
            toast.success('Profile updated successfully');
            router.refresh();

            // Clear the temporary file/preview
            if (preview) {
                URL.revokeObjectURL(preview);
                setPreview(null);
                setSelectedFile(null);
            }
        } catch (error) {
            console.error('Profile update error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to update profile');
        } finally {
            setUploadingImage(false);
        }
    }, [selectedFile, preview, update, router]);

    return {
        form: formValues,
        errors,
        register,
        preview,
        saving,
        uploadingImage,
        isFetchingLocation,
        session,
        status,
        handleFileChange,
        fetchUserLocation,
        handleSubmit: handleSubmit(onSubmit)
    };
}

