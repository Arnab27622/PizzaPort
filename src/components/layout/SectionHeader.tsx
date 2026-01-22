"use client";

import React from 'react';

/**
 * Props for the SectionHeader component
 * @typedef {Object} SectionHeaderProps
 * @property {string} subHeader - The subtitle text to display (uppercase, smaller)
 * @property {string} mainHeader - The main title text to display (larger, prominent)
 */
type SectionHeaderProps = {
    subHeader: string;
    mainHeader: string;
};

/**
 * A reusable section header component for consistent page sections
 * 
 * @component
 * @description 
 * - Displays a subtitle and main title in a centered layout
 * - Includes a decorative underline element
 * - Uses consistent typography and spacing
 * - Responsive text sizing for different screen sizes
 * 
 * @param {SectionHeaderProps} props - Component properties
 * @param {string} props.subHeader - The subtitle text
 * @param {string} props.mainHeader - The main title text
 * 
 * @example
 * <SectionHeader 
 *   subHeader="Our Story" 
 *   mainHeader="About PizzaPort" 
 * />
 * 
 * @returns {JSX.Element} A styled section header with subtitle, title, and underline
 */
function SectionHeader({ subHeader, mainHeader }: SectionHeaderProps) {
    return (
        <div className='text-center mb-9'>
            {/* Subtitle - uppercase with tracking for better readability */}
            <h3 className='uppercase font-bold tracking-wider text-primary heading-border'>
                {subHeader}
            </h3>

            {/* Main title - responsive text sizing with white color */}
            <h2 className='text-4xl md:text-5xl font-bold text-white mb-4 heading-border'>
                {mainHeader}
            </h2>

            {/* Decorative underline element */}
            <div className='w-24 h-1 bg-primary mx-auto rounded-full'></div>
        </div>
    )
}

export default SectionHeader;