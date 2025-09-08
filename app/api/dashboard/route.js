import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { connectDB } from '../../../lib/mongodb';
import Sale from '../../../lib/models/Sale';
import Purchase from '../../../lib/models/Purchase';
import Customer from '../../../lib/models/Customer';
import Vendor from '../../../lib/models/Vendor';
import Product from '../../../lib/models/Product';
import dashboardCache from '../../../lib/cache/dashboardCache';

// GET /api/dashboard - Get dashboard overview data
export async function GET() {
  try {
    // Check for NextAuth session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // OPTIMIZED: Check cache first
    const cacheKey = `dashboard_${session.user.id}`;
    const cachedData = dashboardCache.get(cacheKey);
    
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    await connectDB();

    // OPTIMIZED: Run all count queries in parallel
    const [
      totalSales,
      totalPurchases,
      totalCustomers,
      totalVendors,
      totalProducts,
      recentSales,
      recentPurchases,
      revenueData,
      expensesData
    ] = await Promise.all([
      Sale.countDocuments(),
      Purchase.countDocuments(),
      Customer.countDocuments(),
      Vendor.countDocuments(),
      Product.countDocuments(),
      Sale.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("invoiceNo total customerName shopName createdAt paymentStatus"),
      Purchase.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("invoiceNo total vendorName createdAt status"),
      Sale.aggregate([
        { $match: { paymentStatus: "Paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]),
      Purchase.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ])
    ]);

    const totalRevenue = revenueData[0]?.total || 0;
    const totalExpenses = expensesData[0]?.total || 0;

    // OPTIMIZED: Run all aggregation queries in parallel
    const currentYear = new Date().getFullYear();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      monthlySales,
      salesTrend,
      purchasesTrend,
      topProducts,
      topCustomers
    ] = await Promise.all([
      // Monthly sales
      Sale.aggregate([
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
      ]),
      
      // Sales trend
      Sale.aggregate([
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
      ]),
      
      // Purchases trend
      Purchase.aggregate([
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
      ]),
      
      // Top products
      Sale.aggregate([
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
      ]),
      
      // Top customers
      Sale.aggregate([
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
      ])
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

    // OPTIMIZED: Cache the result
    dashboardCache.set(cacheKey, dashboardData);

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { message: "Error fetching dashboard data", error: error.message },
      { status: 500 }
    );
  }
}
