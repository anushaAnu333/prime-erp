import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: process.env.NODE_ENV === "production",
    optimizePackageImports: ["@/components/ui"],
  },
  // Fix Turbopack root directory warning
  turbopack: {
    root: path.join(__dirname, "."),
  },

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

  // Webpack optimizations for better performance (only when not using Turbopack)
  ...(process.env.NODE_ENV === "production" && {
    webpack: (config, { dev, isServer }) => {
      // Optimize bundle size
      if (!dev && !isServer) {
        config.optimization.splitChunks = {
          chunks: "all",
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
            },
          },
        };
      }

      // Add path alias for backend (remove in production)
      if (process.env.NODE_ENV === "development") {
        config.resolve.alias = {
          ...config.resolve.alias,
          "@backend": path.join(__dirname, "../backend"),
        };
      }

      return config;
    },
  }),
};

export default nextConfig;
