"use client";

import React, { memo } from 'react'

/**
 * Footer component that displays copyright information and attribution
 * 
 * @component
 * @description A reusable footer with dynamic year display and styling
 * @example
 * return <Footer />
 * 
 * @returns {JSX.Element} Footer element with copyright and attribution
 */
function Footer() {
  // Get current year for dynamic copyright display
  const currentYear = new Date().getFullYear();

  return (
    <footer className='border-t border-amber-900/30 p-8 text-center text-amber-500 bg-[#19120c] w-full'>
      {/* Copyright information with dynamic year */}
      <p className='text-sm'>
        &copy; {currentYear} PizzaPort. All rights reserved.
      </p>

      {/* Attribution line with love emoji */}
      <p className='text-xs mt-2 text-amber-400'>
        Made with <span role="img" aria-label="love">❤️</span> by Arnab
      </p>
    </footer>
  )
}

// Export memoized component to prevent unnecessary re-renders
export default memo(Footer)