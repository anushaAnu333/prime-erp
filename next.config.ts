import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Development optimizations
  ...(process.env.NODE_ENV === "development" && {
    // Faster builds in development
    experimental: {
      optimizeCss: false, // Disable in development for faster builds
      optimizePackageImports: ["@/components/ui"],
      // Enable server components for better performance
      serverComponentsExternalPackages: ["mongoose"],
      // Faster refresh in development
      turbo: {
        rules: {
          "*.svg": {
            loaders: ["@svgr/webpack"],
            as: "*.js",
          },
        },
      },
    },
  }),

  // Production optimizations
  ...(process.env.NODE_ENV === "production" && {
    experimental: {
      optimizeCss: true,
      optimizePackageImports: ["@/components/ui"],
      serverComponentsExternalPackages: ["mongoose"],
    },
  }),

  // Image optimization
  images: {
    domains: [],
    formats: ["image/webp", "image/avif"],
    // Optimize image loading
    minimumCacheTTL: 60,
  },

  // Compression (only in production)
  ...(process.env.NODE_ENV === "production" && { compress: true }),

  // Bundle analyzer (optional for debugging)
  // bundleAnalyzer: process.env.ANALYZE === 'true',

  // Optimize for Vercel (only in production)
  ...(process.env.NODE_ENV === "production" && { output: "standalone" }),

  // Performance optimizations
  poweredByHeader: false,
};

export default nextConfig;
