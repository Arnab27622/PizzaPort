/**
 * This custom hook allows the app to find the user's current physical address.
 * It uses the browser's GPS (Geolocation) and then converts those coordinates
 * into a human-readable address.
 */

import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { UseFormSetValue } from 'react-hook-form';

/**
 * useUserLocation Hook
 * Takes a setValue function from react-hook-form to update the address field.
 */
export function useUserLocation(setValue?: UseFormSetValue<{ address: string }>) {
    const [isFetchingLocation, setIsFetchingLocation] = useState(false); // True while GPS is working

    /**
     * The main function to trigger location fetching.
     */
    const fetchUserLocation = useCallback(async () => {
        // 1. Check if the browser even supports GPS
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setIsFetchingLocation(true);
        try {
            // 2. Ask the user for permission and get the coordinates (Lat/Lon)
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    timeout: 10000,
                    maximumAge: 60000
                });
            });

            const { latitude, longitude } = position.coords;

            // 3. Convert coordinates to an address using the Nominatim API
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );

            if (!res.ok) throw new Error("Failed to fetch address");

            const data = await res.json();

            // 4. If we found an address, update the form
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

