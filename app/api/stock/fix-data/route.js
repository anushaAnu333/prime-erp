import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Stock from '../../../../lib/models/Stock';

// POST /api/stock/fix-data - Fix stock data with proper opening stock
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { stockId, openingStock } = body;
    
    if (!stockId || openingStock === undefined) {
      return NextResponse.json(
        { message: "Stock ID and opening stock are required" },
        { status: 400 }
      );
    }

    const stock = await Stock.findById(stockId);
    
    if (!stock) {
      return NextResponse.json(
        { message: "Stock entry not found" },
        { status: 404 }
      );
    }

    // Update the opening stock
    stock.openingStock = openingStock;
    
    // The pre-save middleware will automatically recalculate:
    // - closingStock = openingStock + totalPurchases - totalSales
    // - stockAvailable = closingStock - stockGiven
    // - isLowStock and isExpired flags
    
    await stock.save();

    return NextResponse.json({
      success: true,
      stock,
      message: "Stock data updated successfully"
    });
  } catch (error) {
    console.error("Error updating stock data:", error);
    return NextResponse.json(
      { message: "Failed to update stock data" },
      { status: 500 }
    );
  }
}

// GET /api/stock/fix-data - Get all stock entries for debugging
export async function GET() {
  try {
    await connectDB();
    
    const stocks = await Stock.find({});
    
    return NextResponse.json({
      success: true,
      stocks: stocks.map(stock => ({
        _id: stock._id,
        product: stock.product,
        openingStock: stock.openingStock,
        totalPurchases: stock.totalPurchases,
        totalSales: stock.totalSales,
        closingStock: stock.closingStock,
        stockGiven: stock.stockGiven,
        stockAvailable: stock.stockAvailable,
        unit: stock.unit,
        isLowStock: stock.isLowStock,
        isExpired: stock.isExpired
      }))
    });
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return NextResponse.json(
      { message: "Failed to fetch stock data" },
      { status: 500 }
    );
  }
}






