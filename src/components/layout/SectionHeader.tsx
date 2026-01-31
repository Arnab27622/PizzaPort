"use client";

/**
 * A reusable Title component for different sections of the website.
 * It shows a small subtitle (like "Our Story") and a big main title (like "About Us").
 * It ensures all section titles look consistent.
 */

import React from 'react';
import { SectionHeaderProps } from '@/types/common';

function SectionHeader({ subHeader, mainHeader }: SectionHeaderProps) {
    return (
        <div className='text-center mb-9'>
            {/* Subtitle - uppercase with tracking for better readability */}
            <h3 className='uppercase font-bold tracking-wider text-primary heading-border drop-shadow-md'>
                {subHeader}
            </h3>

            {/* Main title - responsive text sizing with white color */}
            <h2 className='text-4xl md:text-5xl font-bold text-white mb-4 heading-border drop-shadow-lg'>
                {mainHeader}
            </h2>

            {/* Decorative underline element */}
            <div className='w-24 h-1 bg-primary mx-auto rounded-full'></div>
        </div>
    )
}

export default SectionHeader;
