"use client";

import { useEffect, useState } from 'react';
import BackgroundLoader from './BackgroundLoader';

/**
 * This component loads the background image for the app.
 * It shows a loading spinner until the background is ready.
 */
export default function BackgroundManager({ children }: { children: React.ReactNode }) {
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    useEffect(() => {
        // Add 'loading' class to body
        document.body.classList.add('loading');

        // Preload the background image
        const img = new Image();
        img.src = '/website-background-dark.webp';

        // When image loads, hide the spinner
        img.onload = () => {
            setIsImageLoaded(true);
            document.body.classList.remove('loading');
            document.body.classList.add('loaded');
        };

        // If image is already cached, trigger immediately
        if (img.complete) {
            img.onload(null as unknown as Event);
        }

        // Cleanup when component unmounts
        return () => {
            document.body.classList.remove('loading', 'loaded');
        };
    }, []);

    return (
        <>
            {!isImageLoaded && <BackgroundLoader />}
            {children}
        </>
    );
}
