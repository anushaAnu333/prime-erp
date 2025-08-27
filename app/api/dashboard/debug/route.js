import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

// Import models with correct syntax
import Sale from "@/models/Sale";
import Purchase from "@/models/Purchase";
import Customer from "@/models/Customer";
import Product from "@/models/Product";

// Debug endpoint to check database data
export async function GET() {
  try {
    await connectDB();

    // Check all collections for data
    const salesCount = await Sale.countDocuments();
    const purchasesCount = await Purchase.countDocuments();
    const customersCount = await Customer.countDocuments();
    const productsCount = await Product.countDocuments();

    // Get sample data
    const sampleSales = await Sale.find().limit(3).lean();
    const samplePurchases = await Purchase.find().limit(3).lean();
    const sampleCustomers = await Customer.find().limit(3).lean();
    const sampleProducts = await Product.find().limit(3).lean();

    return NextResponse.json({
      message: "Database debug info",
      counts: {
        sales: salesCount,
        purchases: purchasesCount,
        customers: customersCount,
        products: productsCount,
      },
      sampleData: {
        sales: sampleSales,
        purchases: samplePurchases,
        customers: sampleCustomers,
        products: sampleProducts,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      {
        message: "Debug endpoint failed",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
