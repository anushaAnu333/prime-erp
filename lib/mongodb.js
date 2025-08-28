import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // Development vs Production connection settings
      ...(process.env.NODE_ENV === "development" && {
        maxPoolSize: 10, // More connections for development
        minPoolSize: 2, // Keep some connections warm
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 30000,
        connectTimeoutMS: 10000,
        maxIdleTimeMS: 60000, // Longer idle time for development
      }),
      ...(process.env.NODE_ENV === "production" && {
        maxPoolSize: 1, // Optimized for serverless - single connection
        minPoolSize: 0, // Start with no connections
        serverSelectionTimeoutMS: 5000, // Faster timeout for serverless
        socketTimeoutMS: 15000, // Reduced timeout
        connectTimeoutMS: 5000, // Faster connection timeout
        maxIdleTimeMS: 15000, // Shorter idle time
        maxConnecting: 1,
      }),
      family: 4,
      // Add connection retry logic
      retryWrites: true,
      retryReads: true,
      // Disable auto-index creation in production
      autoIndex: process.env.NODE_ENV !== "production",
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("MongoDB connected successfully");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("MongoDB connection error:", e);
    throw e;
  }

  return cached.conn;
}

export { connectDB };
