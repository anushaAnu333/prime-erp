import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["@/components/ui"],
  },

  // Image optimization
  images: {
    domains: [],
    formats: ["image/webp", "image/avif"],
  },

  // Compression
  compress: true,

  // Bundle analyzer (optional for debugging)
  // bundleAnalyzer: process.env.ANALYZE === 'true',

  // Optimize for Vercel
  output: "standalone",

  // Reduce bundle size (swcMinify is now default in Next.js 15)

  // Optimize fonts (optimizeFonts is now default in Next.js 15)
};

export default nextConfig;
