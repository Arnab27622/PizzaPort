"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * ScrollToTop Component
 * 
 * Automatically scrolls the window to the top whenever the route changes.
 * This fixes the common issue in Next.js where scroll position is preserved
 * between different pages.
 * 
 * @component
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // If there's a hash (e.g., #about), don't scroll to top 
    // to allow the browser to jump to the anchor
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
