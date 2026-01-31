"use client";

/**
 * The Footer appears at the very bottom of every page.
 * It shows the copyright year (which updates automatically) and credits.
 */

import React, { memo } from 'react'

function Footer() {
  // Get current year for dynamic copyright display
  const currentYear = new Date().getFullYear();

  return (
    <footer className='border-t border-amber-900/30 p-8 text-center text-amber-500 bg-black/90 w-full'>
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

// Export using "memo" so it doesn't re-render unnecessarily (since it rarely changes)
export default memo(Footer)
