import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { UseFormSetValue } from 'react-hook-form';

export function useUserLocation(setValue?: UseFormSetValue<{ address: string }>) {
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);

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
                if (setValue) {
                    setValue('address', data.display_name, { shouldValidate: true });
                }
                toast.success("Location fetched successfully");
            }
        } catch (error) {
            console.error("Failed to fetch address:", error);
            toast.error("Could not fetch your location. Please enter manually.");
        } finally {
            setIsFetchingLocation(false);
        }
    }, [setValue]);

    return {
        isFetchingLocation,
        fetchUserLocation
    };
}
