const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
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

// Mock data for testing without database
const mockData = {
  users: [
    { id: 1, username: "admin", email: "admin@example.com", role: "admin" },
    { id: 2, username: "user", email: "user@example.com", role: "user" }
  ],
  products: [
    { id: 1, name: "Product 1", price: 100, category: "Electronics" },
    { id: 2, name: "Product 2", price: 200, category: "Clothing" }
  ]
};

// Mock routes for testing
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString(), mode: "development-no-db" });
});

app.get("/api/users", (req, res) => {
  res.json(mockData.users);
});

app.get("/api/products", (req, res) => {
  res.json(mockData.products);
});

// Mock auth endpoints
app.post("/api/auth/login", (req, res) => {
  const { username, email, password } = req.body;
  
  // Accept both username and email for flexibility
  const userIdentifier = username || email;
  
  // Accept the original credentials that the frontend expects
  if ((userIdentifier === "admin" && password === "admin") || 
      (userIdentifier === "admin@prima.com" && password === "admin123")) {
    res.json({ 
      success: true, 
      user: { 
        _id: "mock-user-id",
        name: "Admin User",
        email: "admin@prima.com", 
        role: "admin",
        companyAccess: ["all"],
        phone: "+1234567890"
      },
      message: "Login successful"
    });
  } else {
    res.status(401).json({ success: false, message: "Invalid email or password" });
  }
});

app.get("/api/auth/me", (req, res) => {
  // Mock current user endpoint
  res.json({ 
    user: { 
      _id: "mock-user-id",
      name: "Admin User",
      email: "admin@prima.com", 
      role: "admin",
      companyAccess: ["all"],
      phone: "+1234567890"
    }
  });
});

// Mock dashboard endpoints
app.get("/api/dashboard", (req, res) => {
  res.json({
    overview: {
      totalSales: 150,
      totalPurchases: 75,
      totalCustomers: 45,
      totalVendors: 12,
      totalProducts: 200,
      totalRevenue: 125000,
      totalExpenses: 80000,
      profit: 45000,
    },
    recentActivity: {
      sales: [
        { id: 1, customer: "John Doe", amount: 1500, date: "2024-01-15" },
        { id: 2, customer: "Jane Smith", amount: 2200, date: "2024-01-14" }
      ],
      purchases: [
        { id: 1, vendor: "ABC Corp", amount: 800, date: "2024-01-15" },
        { id: 2, vendor: "XYZ Ltd", amount: 1200, date: "2024-01-14" }
      ],
    },
    monthlyStats: {
      sales: [
        { month: "Jan", amount: 25000 },
        { month: "Feb", amount: 30000 },
        { month: "Mar", amount: 35000 }
      ],
    },
    salesTrend: [
      { date: "2024-01-01", amount: 1000 },
      { date: "2024-01-02", amount: 1200 },
      { date: "2024-01-03", amount: 900 }
    ],
    purchasesTrend: [
      { date: "2024-01-01", amount: 500 },
      { date: "2024-01-02", amount: 600 },
      { date: "2024-01-03", amount: 450 }
    ],
    topProducts: [
      { name: "Product A", sales: 50, revenue: 5000 },
      { name: "Product B", sales: 30, revenue: 3000 }
    ],
    topCustomers: [
      { name: "John Doe", orders: 15, total: 15000 },
      { name: "Jane Smith", orders: 12, total: 12000 }
    ]
  });
});

app.get("/api/dashboard/stats", (req, res) => {
  res.json({
    totalRevenue: 125000,
    totalOrders: 150,
    totalCustomers: 45,
    conversionRate: 3.2
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT} (Development mode - no database)`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
