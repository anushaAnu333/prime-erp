import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Sale from '../../../lib/models/Sale';
import Purchase from '../../../lib/models/Purchase';
import Customer from '../../../lib/models/Customer';
import Vendor from '../../../lib/models/Vendor';
import Product from '../../../lib/models/Product';
import dashboardCache from '../../../lib/cache/dashboardCache';

// GET /api/debug - Debug endpoint to check actual database counts
export async function GET() {
  try {
    await connectDB();

    // Get actual counts from database
    const actualCounts = {
      sales: await Sale.countDocuments(),
      purchases: await Purchase.countDocuments(),
      customers: await Customer.countDocuments(),
      vendors: await Vendor.countDocuments(),
      products: await Product.countDocuments(),
    };

    // Get some sample data to see what's in the database
    const sampleSales = await Sale.find().limit(3).select('invoiceNo customerName total createdAt');
    const samplePurchases = await Purchase.find().limit(3).select('invoiceNo vendorName total createdAt');

    // Clear the dashboard cache
    dashboardCache.clear();

    return NextResponse.json({
      message: 'Debug information',
      actualCounts,
      sampleSales,
      samplePurchases,
      cacheCleared: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug API Error:', error);
    return NextResponse.json(
      { message: "Error fetching debug data", error: error.message },
      { status: 500 }
    );
  }
}
