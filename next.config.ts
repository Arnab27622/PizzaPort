import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization settings
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      }
    ],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // Image sizes for the sizes attribute
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Production compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Experimental performance features
  experimental: {
    // Optimize CSS loading
    optimizeCss: true,
    // Optimize package imports
    optimizePackageImports: ['framer-motion', 'react-toastify', 'swr'],
  },

  // Add caching headers for better performance
  async headers() {
    return [
      {
        // Cache static assets aggressively
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache API responses for menu items (1 minute)
        source: '/api/menuitem/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
      {
        // Cache bestsellers API (2 minutes)
        source: '/api/menuitem/bestsellers',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=120, stale-while-revalidate=600',
          },
        ],
      },
    ];
  },

  // Enable source maps only in development
  productionBrowserSourceMaps: false,
};

export default nextConfig;
