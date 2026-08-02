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

      {/* Attribution line */}
      <p className='text-xs mt-2 text-amber-400/80 inline-flex items-center justify-center gap-1.5'>
        <span>Crafted with</span>
        <svg className="w-3.5 h-3.5 text-red-500 fill-current inline" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span>by Arnab</span>
      </p>
    </footer>
  )
}

// Export using "memo" so it doesn't re-render unnecessarily (since it rarely changes)
export default memo(Footer)
