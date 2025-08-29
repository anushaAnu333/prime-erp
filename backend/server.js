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
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-domain.com"]
        : ["http://localhost:3000", "http://localhost:3002"],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Import routes
const authRoutes = require("./routes/auth");
const salesRoutes = require("./routes/sales");
const customersRoutes = require("./routes/customers");
const productsRoutes = require("./routes/products");
const purchasesRoutes = require("./routes/purchases");
const vendorsRoutes = require("./routes/vendors");
const stockRoutes = require("./routes/stock");
const paymentsRoutes = require("./routes/payments");
const dashboardRoutes = require("./routes/dashboard");
const usersRoutes = require("./routes/users");
const companiesRoutes = require("./routes/companies");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/purchases", purchasesRoutes);
app.use("/api/vendors", vendorsRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/companies", companiesRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
};

startServer();
