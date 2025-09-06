const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");
const Purchase = require("../models/Purchase");
const Customer = require("../models/Customer");
const Vendor = require("../models/Vendor");
const Product = require("../models/Product");
const { connectDB } = require("../lib/mongodb");

// Get dashboard overview data
router.get("/", async (req, res) => {
  try {
    await connectDB();

    // Get counts
    const totalSales = await Sale.countDocuments();
    const totalPurchases = await Purchase.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    const totalVendors = await Vendor.countDocuments();
    const totalProducts = await Product.countDocuments();

    // Get recent sales (last 5)
    const recentSales = await Sale.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("invoiceNo total customerName shopName createdAt paymentStatus");

    // Get recent purchases (last 5)
    const recentPurchases = await Purchase.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("invoiceNo total vendorName createdAt status");

    // Calculate total revenue (sum of all sales)
    const salesData = await Sale.find({ paymentStatus: "Paid" });
    const totalRevenue = salesData.reduce((sum, sale) => sum + (sale.total || 0), 0);

    // Calculate total expenses (sum of all purchases)
    const purchaseData = await Purchase.find({ status: "completed" });
    const totalExpenses = purchaseData.reduce((sum, purchase) => sum + (purchase.total || 0), 0);

    // Get monthly stats for the current year
    const currentYear = new Date().getFullYear();
    const monthlySales = await Sale.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
          revenue: { $sum: "$total" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Get sales trend data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const salesTrend = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          sales: { $sum: "$total" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              { $toString: "$_id.month" }
            ]
          },
          sales: 1,
          count: 1
        }
      },
      { $sort: { month: 1 } }
    ]);

    // Get purchases trend data for the last 6 months
    const purchasesTrend = await Purchase.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          purchases: { $sum: "$total" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              { $toString: "$_id.month" }
            ]
          },
          purchases: 1,
          count: 1
        }
      },
      { $sort: { month: 1 } }
    ]);

    // Get top products by revenue
    const topProducts = await Sale.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          revenue: { $sum: { $multiply: ["$items.qty", "$items.rate"] } },
          quantity: { $sum: "$items.qty" }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          revenue: 1,
          quantity: 1
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    // Get top customers by sales
    const topCustomers = await Sale.aggregate([
      {
        $group: {
          _id: "$customerId",
          customerName: { $first: "$customerName" },
          totalSales: { $sum: "$total" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          customerId: "$_id",
          customerName: 1,
          totalSales: 1,
          count: 1
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: 5 }
    ]);

    const dashboardData = {
      overview: {
        totalSales,
        totalPurchases,
        totalCustomers,
        totalVendors,
        totalProducts,
        totalRevenue,
        totalExpenses,
        profit: totalRevenue - totalExpenses
      },
      recentActivity: {
        sales: recentSales,
        purchases: recentPurchases
      },
      monthlyStats: {
        sales: monthlySales
      },
      salesTrend,
      purchasesTrend,
      topProducts,
      topCustomers
    };

    res.json(dashboardData);
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
});

// Get dashboard statistics
router.get("/stats", async (req, res) => {
  try {
    await connectDB();

    // Get counts for different statuses
    const pendingSales = await Sale.countDocuments({ paymentStatus: "Pending" });
    const completedSales = await Sale.countDocuments({ paymentStatus: "Paid" });
    const pendingPurchases = await Purchase.countDocuments({ status: "pending" });
    const completedPurchases = await Purchase.countDocuments({ status: "completed" });

    // Get top customers by sales
    const topCustomers = await Sale.aggregate([
      {
        $group: {
          _id: "$customerId",
          customerName: { $first: "$customerName" },
          totalSales: { $sum: "$total" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          customerId: "$_id",
          customerName: 1,
          totalSales: 1,
          count: 1
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: 5 }
    ]);

    // Get top products by sales
    const topProducts = await Sale.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalQuantity: { $sum: "$items.qty" },
          totalRevenue: { $sum: { $multiply: ["$items.qty", "$items.rate"] } }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          totalQuantity: 1,
          totalRevenue: 1
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    const stats = {
      sales: {
        pending: pendingSales,
        completed: completedSales,
        total: pendingSales + completedSales
      },
      purchases: {
        pending: pendingPurchases,
        completed: completedPurchases,
        total: pendingPurchases + completedPurchases
      },
      topCustomers,
      topProducts
    };

    res.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Error fetching dashboard statistics" });
  }
});

module.exports = router;
