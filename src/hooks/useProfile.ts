import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ExtendedUser, ProfileFormState } from '@/types/user';

const ProfileSchema = z.object({
    name: z.string().min(1, 'Full Name is required').max(50, 'Name is too long'),
    email: z.string().email('Invalid email address'),
    address: z.string().min(1, 'Address is required').max(200, 'Address is too long'),
    gender: z.string().min(1, 'Please select a gender'),
});

export function useProfile() {
    const { data: session, status, update } = useSession({ required: true });
    const router = useRouter();

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

    const [preview, setPreview] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const formValues = watch();

    useEffect(() => {
        if (status === 'authenticated' && session?.user) {
            const user = session.user as ExtendedUser;
            reset({
                name: user.name ?? '',
                email: user.email ?? '',
                address: user.address ?? '',
                gender: user.gender ?? '',
            });
        }
    }, [status, session, reset]);

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

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

    const fetchUserLocation = useCallback(async () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setIsFetchingLocation(true);
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    timeout: 10000,
                    maximumAge: 60000
                });
            });

            const { latitude, longitude } = position.coords;
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );

            if (!res.ok) throw new Error("Failed to fetch address");

            const data = await res.json();
            if (data.display_name) {
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

    const onSubmit = useCallback(async (data: ProfileFormState) => {
        try {
            const body = new FormData();
            body.append('name', data.name.trim());
            body.append('address', data.address.trim());
            body.append('gender', data.gender);

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

            await update();
            toast.success('Profile updated successfully');
            router.refresh();

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
