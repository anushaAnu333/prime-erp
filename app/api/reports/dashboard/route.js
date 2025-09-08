import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Sale from "@/lib/models/Sale";
import Purchase from "@/lib/models/Purchase";
import Customer from "@/lib/models/Customer";
import Vendor from "@/lib/models/Vendor";

// GET /api/reports/dashboard - Dashboard Summary Report
export async function GET() {
  try {
    await connectDB();
    
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Today's sales
    const todaySales = await Sale.find({
      date: { $gte: startOfDay },
      type: 'Sale'
    });
    
    // Month's sales
    const monthSales = await Sale.find({
      date: { $gte: startOfMonth },
      type: 'Sale'
    });
    
    // Today's purchases
    const todayPurchases = await Purchase.find({
      date: { $gte: startOfDay }
    });
    
    // Month's purchases
    const monthPurchases = await Purchase.find({
      date: { $gte: startOfMonth }
    });
    
    const dashboardData = {
      sales: {
        today: {
          count: todaySales.length,
          amount: todaySales.reduce((sum, sale) => sum + (sale.total || 0), 0)
        },
        month: {
          count: monthSales.length,
          amount: monthSales.reduce((sum, sale) => sum + (sale.total || 0), 0)
        }
      },
      purchases: {
        today: {
          count: todayPurchases.length,
          amount: todayPurchases.reduce((sum, purchase) => sum + (purchase.total || 0), 0)
        },
        month: {
          count: monthPurchases.length,
          amount: monthPurchases.reduce((sum, purchase) => sum + (purchase.total || 0), 0)
        }
      },
      customers: {
        total: await Customer.countDocuments(),
        active: await Customer.countDocuments({ isActive: true })
      },
      vendors: {
        total: await Vendor.countDocuments(),
        active: await Vendor.countDocuments({ isActive: true })
      }
    };
    
    return NextResponse.json({
      success: true,
      dashboard: dashboardData
    });
    
  } catch (error) {
    console.error("Error generating dashboard report:", error);
    return NextResponse.json(
      { message: "Failed to generate dashboard report" },
      { status: 500 }
    );
  }
}
