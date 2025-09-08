import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Sale from '../../../../lib/models/Sale';
import Purchase from '../../../../lib/models/Purchase';

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET() {
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

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { message: "Error fetching dashboard statistics" },
      { status: 500 }
    );
  }
}
