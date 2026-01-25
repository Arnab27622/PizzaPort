'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

interface BackButtonProps {
  className?: string;
  label?: string;
  href?: string;
}

/**
 * BackButton Component
 * 
 * Reusable back navigation button with responsive styling
 * Provides consistent navigation experience across all pages
 * 
 * @component
 * @example
 * <BackButton />
 * <BackButton label="Back to Menu" />
 * 
 * @features
 * - Responsive sizing for all devices
 * - Accessibility support with proper ARIA labels
 * - Smooth hover transitions
 * - Mobile-friendly touch targets
 * - Keyboard navigation support
 */
export default function BackButton({
  className = '',
  label = 'Back',
  href
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 px-5 py-2.5 md:py-2 text-white bg-[#FF5500] hover:bg-[#e14a00] rounded font-semibold transition-colors cursor-pointer text-sm md:text-base ${className}`}
      aria-label="Go back to previous page"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      <span>{label}</span>
    </button>
  );
}
