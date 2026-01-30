'use client';

/**
 * A reusable loading spinner component.
 * It shows a rotating animation to let the user know something is happening in the background.
 * You can customize how big it is (size) and what color it is.
 */

import React from 'react';
import { LoadingSpinnerProps } from '@/types/common';

function LoadingSpinner({ size = 'md', color = 'text-primary', className = '' }: LoadingSpinnerProps) {
    // Maps simple size names like "sm" or "lg" to actual CSS classes
    const sizeMap = {
        xs: 'w-4 h-4',
        sm: 'w-6 h-6',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-40 h-40'
    };

    return (
        <div className={`inline-flex items-center justify-center ${className}`}>
            <svg
                className={`animate-spin ${sizeMap[size]} ${color}`}
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Custom CSS animations for a smooth spinning effect */}
                <style>{`
                    .spinner_V8m1{
                        transform-origin: center;
                        animation: spinner_zKoa 2s linear infinite;
                    }
                    .spinner_V8m1 circle{
                        stroke-linecap: round;
                        animation: spinner_YpZS 1.5s ease-in-out infinite;
                    }
                    @keyframes spinner_zKoa{
                        100%{transform:rotate(360deg)}
                    }
                    @keyframes spinner_YpZS{
                        0%{stroke-dasharray:0 150;stroke-dashoffset:0}
                        47.5%{stroke-dasharray:42 150;stroke-dashoffset:-16}
                        95%,100%{stroke-dasharray:42 150;stroke-dashoffset:-59}
                    }
                `}</style>
                <g className="spinner_V8m1">
                    <circle cx="12" cy="12" r="9.5" fill="none" strokeWidth="3"></circle>
                </g>
            </svg>
        </div>
    )
}

export default LoadingSpinner

