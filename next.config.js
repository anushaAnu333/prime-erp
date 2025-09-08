const path = require("path");

const nextConfig = {
  // Enable React strict mode for better performance
  reactStrictMode: true,
  
  experimental: {
    // Temporarily disable experimental features that might cause issues
    // optimizeCss: process.env.NODE_ENV === "production",
    // optimizePackageImports: ["@/components/ui", "lucide-react", "@heroicons/react"],
  },

  // Image optimization
  images: {
    domains: [],
    formats: ["image/webp", "image/avif"],
    // Optimize image loading
    minimumCacheTTL: 60,
    // Enable image optimization
    unoptimized: false,
  },

  // Compression (only in production)
  ...(process.env.NODE_ENV === "production" && { compress: true }),

  // Bundle analyzer (optional for debugging)
  // bundleAnalyzer: process.env.ANALYZE === 'true',

  // Optimize for Vercel (only in production)
  // Temporarily disable standalone output to avoid build issues
  // ...(process.env.NODE_ENV === "production" && { output: "standalone" }),

  // Performance optimizations
  poweredByHeader: false,
  
  // Build optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  
  // Reduce build time
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Enable SWC minification for better performance (default in Next.js 13+)
  // swcMinify: true,

  // Webpack optimizations for better performance
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size and build speed
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: "all",
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
            priority: 10,
          },
          common: {
            name: "common",
            minChunks: 2,
            chunks: "all",
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };
    }

    // Optimize module resolution
    config.resolve.symlinks = false;
    config.resolve.cacheWithContext = false;

    return config;
  },
};

module.exports = nextConfig;