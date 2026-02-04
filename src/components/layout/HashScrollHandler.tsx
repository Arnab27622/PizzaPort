"use client";

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * HashScrollHandler
 * 
 * This component ensures that anchor links (like #about) work correctly
 * even when navigating from other pages. It uses a more aggressive retry
 * strategy to handle layout shifts caused by dynamic content loading.
 */
export default function HashScrollHandler() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const lastHashHandled = useRef<string>('');

    useEffect(() => {
        const handleHashScroll = () => {
            const hash = window.location.hash;
            if (!hash) {
                lastHashHandled.current = '';
                return;
            }

            // Only scroll if the hash has changed or we haven't scrolled to this hash on this page load
            // This prevents fighting with user's manual scrolling
            const hashId = hash.replace('#', '');

            let retryCount = 0;
            const maxRetries = 15; // Up to 3 seconds with 200ms intervals

            const attemptScroll = () => {
                const element = document.getElementById(hashId);
                if (element) {
                    // Force a small delay to let page height stabilize
                    setTimeout(() => {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        lastHashHandled.current = hash;
                    }, 100);
                } else if (retryCount < maxRetries) {
                    retryCount++;
                    setTimeout(attemptScroll, 200);
                }
            };

            attemptScroll();
        };

        // Initial check on mount/pathname change
        handleHashScroll();

        // Listen for internal hash changes (clicking links on same page)
        window.addEventListener('hashchange', handleHashScroll);

        return () => {
            window.removeEventListener('hashchange', handleHashScroll);
        };
    }, [pathname, searchParams]); // Run on navigation

    return null;
}
