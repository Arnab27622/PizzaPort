"use client";

import { useEffect } from 'react';

/**
 * This component manages the background image loading.
 * OPTIMIZED: Content is shown immediately while background loads.
 * This prevents the "frozen" feeling on slow connections.
 */
export default function BackgroundManager({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        document.body.classList.add('loaded');
        return () => {
            document.body.classList.remove('loaded');
        };
    }, []);

    return <>{children}</>;
}
