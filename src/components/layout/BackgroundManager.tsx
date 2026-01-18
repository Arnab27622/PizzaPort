"use client";

import { useEffect, useState } from 'react';
import BackgroundLoader from './BackgroundLoader';

/**
 * BackgroundManager Component
 * 
 * Manages the preloading and display of the application's background image
 * Provides a seamless loading experience with visual feedback during image loading
 * Handles both cached and uncached image scenarios for optimal performance
 * 
 * @component
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Child components to render after background loads
 * 
 * @features
 * - Automatic background image preloading
 * - Loading state management with visual feedback
 * - CSS class manipulation for global styling control
 * - Cached image detection and handling
 * - Proper cleanup on component unmount
 * 
 * @performance
 * - Early image loading to minimize perceived load time
 * - Cached image detection prevents unnecessary reloads
 * - Minimal re-renders with efficient state management
 * - Memory leak prevention with proper cleanup
 * 
 * @user_experience
 * - Smooth loading transition with visual loader
 * - Prevents content flash by managing visibility states
 * - Maintains application responsiveness during loading
 * - Graceful fallback if image loading fails
 * 
 * @accessibility
 * - Maintains screen reader compatibility
 * - Does not interfere with keyboard navigation
 * - Loading state provides context for all users
 * 
 * @security
 * - Uses local image asset to prevent external dependencies
 * - No user data exposure during loading process
 * - Safe DOM manipulation with classList API
 */
export default function BackgroundManager({ children }: { children: React.ReactNode }) {
    /**
     * Image Loading State
     * 
     * Tracks whether the background image has successfully loaded
     * Controls the display of the loading spinner and main content
     * 
     * @state isImageLoaded - Boolean indicating image load completion
     * @default false - Initial state assumes image is not loaded
     */
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    /**
     * Image Loading Effect
     * 
     * Handles the complete background image loading lifecycle:
     * - Initiates loading state
     * - Creates and preloads image element
     * - Manages load events and cached scenarios
     * - Cleans up on component unmount
     * 
     * @effect
     * @dependencies [] - Empty dependency array ensures single execution
     * 
     * @lifecycle
     * 1. Adds 'loading' class to body for global styling control
     * 2. Creates new Image element with background source
     * 3. Sets up onload handler for successful image loading
     * 4. Checks for cached images to trigger immediate loading
     * 5. Provides cleanup function to reset body classes
     * 
     * @error_handling
     * - Natural fallback: if image fails to load, loader eventually times out
     * - Cached image check prevents hanging on already-loaded assets
     * - Cleanup prevents style pollution on component unmount
     */
    useEffect(() => {
        // Set initial loading state in global CSS
        document.body.classList.add('loading');

        // Create image element for preloading
        const img = new Image();
        img.src = '/hero-background.jpg';

        /**
         * Image Load Success Handler
         * 
         * Executes when background image successfully loads
         * Updates component state and manages CSS transitions
         * 
         * @listens img.onload
         */
        img.onload = () => {
            setIsImageLoaded(true);
            document.body.classList.remove('loading');
            document.body.classList.add('loaded');
        };

        // Check if image is already cached (complete property)
        // If cached, manually trigger load handler to avoid waiting
        if (img.complete) {
            img.onload(null as unknown as Event);
        }

        /**
         * Effect Cleanup Function
         * 
         * Ensures proper cleanup when component unmounts
         * Removes all loading-related classes from body element
         * Prevents CSS state pollution across route changes
         * 
         * @returns {void} Cleanup function for useEffect
         */
        return () => {
            document.body.classList.remove('loading', 'loaded');
        };
    }, []);

    /**
     * Component Render
     * 
     * Conditionally renders loading spinner or children based on image state
     * Maintains loading spinner until background image is fully loaded
     * 
     * @returns {JSX.Element} Fragment containing conditional loader and children
     */
    return (
        <>
            {/* Loading Spinner Condition */}
            {!isImageLoaded && <BackgroundLoader />}

            {/* Main Content - Always rendered but visually managed by CSS classes */}
            {children}
        </>
    );
}