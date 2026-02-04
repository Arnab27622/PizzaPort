"use client";

import { useEffect, useState } from 'react';

/**
 * This component manages the background image loading.
 * OPTIMIZED: Content is shown immediately while background loads.
 * This prevents the "frozen" feeling on slow connections.
 */
export default function BackgroundManager({ children }: { children: React.ReactNode }) {
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    useEffect(() => {
        // Check if we're on the client side
        if (typeof window === 'undefined') return;

        // Start with loading state
        document.body.classList.add('loading');

        // Create a new image to preload the background
        const img = new Image();
        img.src = '/website-background-dark.webp';

        const handleLoad = () => {
            setIsImageLoaded(true);
            document.body.classList.remove('loading');
            document.body.classList.add('loaded');
        };

        // If image is already cached, load immediately
        if (img.complete) {
            handleLoad();
        } else {
            img.onload = handleLoad;
            // Fallback: If image takes too long, show content anyway
            const timeout = setTimeout(() => {
                handleLoad();
            }, 3000);

            return () => {
                clearTimeout(timeout);
                img.onload = null;
            };
        }

        // Cleanup on unmount
        return () => {
            document.body.classList.remove('loading', 'loaded');
        };
    }, []);

    return (
        <>
            {/* Subtle loading indicator that doesn't block content */}
            {!isImageLoaded && (
                <div
                    className="fixed inset-0 bg-linear-to-br from-amber-900/90 to-orange-900/90 z-[-5] transition-opacity duration-500"
                    style={{ opacity: isImageLoaded ? 0 : 1 }}
                    aria-hidden="true"
                />
            )}
            {children}
        </>
    );
}
