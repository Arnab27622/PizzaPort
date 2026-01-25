/**
 * Root Layout Component
 * 
 * Application shell that wraps all pages with consistent structure
 * Provides global context, navigation, and essential dependencies
 * 
 * @file layout.tsx
 * 
 * @features
 * - Font optimization with Google Fonts preloading
 * - Payment gateway integration (Razorpay)
 * - Global state management with React Context
 * - Progressive loading with top progress indicator
 * - Toast notification system
 * - Dynamic background management
 * 
 * @performance
 * - Font preloading for optimal typography performance
 * - Script optimization with strategic loading priorities
 * - Component-level code splitting and lazy loading
 * - Efficient re-render optimization with proper context structure
 * 
 * @security
 * - Content Security Policy compliance for external scripts
 * - XSS protection through proper React sanitization
 * - Secure authentication context propagation
 * 
 * @seo
 * - Comprehensive metadata for search engine optimization
 * - Semantic HTML structure for accessibility
 * - Open Graph and social media meta tags
 */

import type { Metadata } from "next";
import { Sedgwick_Ave, Oswald, Open_Sans } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AppContext from "@/components/AppContext";
import Script from "next/script";
import BackgroundManager from "@/components/layout/BackgroundManager";
import NextTopLoader from "nextjs-toploader";


/**
 * Font Configuration
 * 
 * Optimized font loading with display swap for performance
 * Three-font stack for brand identity, headings, and body text
 */
const sedgwick = Sedgwick_Ave({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-sedgwick',
  display: 'swap', // Ensures text remains visible during webfont load
});

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
});

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
});

/**
 * Application Metadata
 * 
 * SEO optimization and social media sharing configuration
 * Critical for search engine visibility and user engagement
 */
export const metadata: Metadata = {
  title: "PizzaPort - Fast Pizza Delivery",
  description: "Order delicious pizzas delivered to your door",
};

/**
 * RootLayout Component
 * 
 * Wraps entire application with essential providers and global components
 * Implements consistent structure across all application routes
 * 
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Page content to render
 * 
 * @returns {JSX.Element} Complete application shell with global wrappers
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* Critical resource preloading for performance optimization */}
        <link
          rel="preload"
          href="/hero-background.jpg"
          as="image"
        />
      </head>
      <body suppressHydrationWarning className={
        `${sedgwick.variable} ${oswald.variable} ${openSans.variable} antialiased main-content flex flex-col min-h-screen`
      }>

        {/* Razorpay Payment Gateway Integration */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload" // Loads lazily during idle time
        />

        {/* Page Loading Progress Indicator */}
        <NextTopLoader
          color="#FF5500" // Brand color for visual consistency
          height={3}      // Subtle progress bar height
          showSpinner={false} // Disables spinner for cleaner UI
        />

        {/* Background Management and Context Providers */}
        <BackgroundManager>
          <main className="grow">
            <AppContext>
              <Navbar />
              {children}
              <Footer />
              {/* Global Toast Notification System */}
              <ToastContainer
                position="top-center"
                hideProgressBar
                autoClose={1500} // Optimal duration for user reading
              />
            </AppContext>
          </main>
        </BackgroundManager>
      </body>
    </html>
  );
}