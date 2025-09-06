const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: process.env.NODE_ENV === "production"
      ? [process.env.CORS_ORIGIN || "https://your-frontend-domain.vercel.app"]
      : ["http://localhost:3000", "http://localhost:3002", "http://127.0.0.1:3000", "http://127.0.0.1:3002"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // Remove deprecated options
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 10000,
      family: 4,
      retryWrites: true,
      retryReads: true,
      autoIndex: process.env.NODE_ENV !== "production",
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Import and setup routes
const setupRoutes = () => {
  try {
    // Import all routes
    const authRoutes = require("./routes/auth.js");
    const dashboardRoutes = require("./routes/dashboard.js");
    const salesRoutes = require("./routes/sales.js");
    const customersRoutes = require("./routes/customers.js");
    const productsRoutes = require("./routes/products.js");
    const purchasesRoutes = require("./routes/purchases.js");
    const vendorsRoutes = require("./routes/vendors.js");
    const stockRoutes = require("./routes/stock.js");
    const paymentsRoutes = require("./routes/payments.js");
    const usersRoutes = require("./routes/users.js");
    const companiesRoutes = require("./routes/companies.js");
    const reportsRoutes = require("./routes/reports.js");

    // Register all routes
    app.use("/api/auth", authRoutes);
    app.use("/api/dashboard", dashboardRoutes);
    app.use("/api/sales", salesRoutes);
    app.use("/api/customers", customersRoutes);
    app.use("/api/products", productsRoutes);
    app.use("/api/purchases", purchasesRoutes);
    app.use("/api/vendors", vendorsRoutes);
    app.use("/api/stock", stockRoutes);
    app.use("/api/payments", paymentsRoutes);
    app.use("/api/users", usersRoutes);
    app.use("/api/companies", companiesRoutes);
    app.use("/api/reports", reportsRoutes);
    
    console.log("All routes loaded successfully");
    
    // List all registered routes for debugging
    console.log("Registered routes:");
    app._router.stack.forEach((middleware) => {
      if (middleware.route) {
        console.log(`${Object.keys(middleware.route.methods)} ${middleware.route.path}`);
      } else if (middleware.name === 'router' && middleware.regexp) {
        // Extract the base path from the regexp
        const regexpStr = middleware.regexp.toString();
        let basePath = '';
        
        // Try to extract the path from the regexp
        if (regexpStr.includes('/api/auth')) basePath = '/api/auth';
        else if (regexpStr.includes('/api/dashboard')) basePath = '/api/dashboard';
        else if (regexpStr.includes('/api/sales')) basePath = '/api/sales';
        else if (regexpStr.includes('/api/customers')) basePath = '/api/customers';
        else if (regexpStr.includes('/api/products')) basePath = '/api/products';
        else if (regexpStr.includes('/api/purchases')) basePath = '/api/purchases';
        else if (regexpStr.includes('/api/vendors')) basePath = '/api/vendors';
        else if (regexpStr.includes('/api/stock')) basePath = '/api/stock';
        else if (regexpStr.includes('/api/payments')) basePath = '/api/payments';
        else if (regexpStr.includes('/api/users')) basePath = '/api/users';
        else if (regexpStr.includes('/api/companies')) basePath = '/api/companies';
        else if (regexpStr.includes('/api/reports')) basePath = '/api/reports';
        
        middleware.handle.stack.forEach((handler) => {
          if (handler.route) {
            console.log(`${Object.keys(handler.route.methods)} ${basePath}${handler.route.path}`);
          }
        });
      }
    });
  } catch (error) {
    console.error("Error loading routes:", error);
    // For now, just continue without routes to get the server running
  }
};

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Start server
const startServer = async () => {
  try {
    console.log("Starting server...");
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Port: ${PORT}`);
    console.log(`MongoDB URI: ${process.env.MONGODB_URI ? 'Set' : 'Not set'}`);
    
    await connectDB();
    setupRoutes();
    
    // Error handling middleware (after routes)
    app.use((err, req, res, next) => {
      console.error("Error middleware caught:", err.stack);
      res.status(500).json({
        error: "Something went wrong!",
        message:
          process.env.NODE_ENV === "development"
            ? err.message
            : "Internal server error",
      });
    });

    // 404 handler (must be last)
    app.use("*", (req, res) => {
      res.status(404).json({ error: "Route not found" });
    });
    
    const server = app.listen(PORT, () => {
      console.log(`✅ Backend server running on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📡 Server is listening on port ${PORT}`);
    });

    // Verify server is listening
    server.on('listening', () => {
      console.log(`🎯 Server is now listening on port ${PORT}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
      }
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
