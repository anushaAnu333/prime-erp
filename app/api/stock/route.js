import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Stock from '../../../lib/models/Stock';

// GET /api/stock - Get all stock data
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const lowStock = searchParams.get('lowStock');
    const expired = searchParams.get('expired');
    
    let query = {};
    if (lowStock === 'true') query.isLowStock = true;
    if (expired === 'true') query.isExpired = true;

    const stocks = await Stock.find(query).sort({ product: 1 });
    
    // Calculate summary
    const summary = {
      totalProducts: stocks.length,
      totalOpeningStock: stocks.reduce((sum, stock) => sum + stock.openingStock, 0),
      totalPurchases: stocks.reduce((sum, stock) => sum + stock.totalPurchases, 0),
      totalSales: stocks.reduce((sum, stock) => sum + stock.totalSales, 0),
      totalClosingStock: stocks.reduce((sum, stock) => sum + stock.closingStock, 0),
      totalStockGiven: stocks.reduce((sum, stock) => sum + stock.stockGiven, 0),
      totalStockDelivered: stocks.reduce((sum, stock) => sum + stock.stockDelivered, 0),
      totalSalesReturns: stocks.reduce((sum, stock) => sum + stock.salesReturns, 0),
      totalStockAvailable: stocks.reduce((sum, stock) => sum + stock.stockAvailable, 0),
      lowStockCount: stocks.filter(stock => stock.isLowStock).length,
      expiredCount: stocks.filter(stock => stock.isExpired).length
    };

    return NextResponse.json({
      success: true,
      stocks,
      summary
    });
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return NextResponse.json(
      { message: "Failed to fetch stock data" },
      { status: 500 }
    );
  }
}

// POST /api/stock - Create new stock entry
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const stockData = {
      ...body,
      closingStock: (body.openingStock || 0) + (body.totalPurchases || 0) - (body.totalSales || 0),
      stockAvailable: (body.openingStock || 0) + (body.totalPurchases || 0) - (body.totalSales || 0) - (body.stockGiven || 0),
      isLowStock: (body.openingStock || 0) < (body.minimumStock || 10),
      isExpired: body.expiryDate ? new Date(body.expiryDate) < new Date() : false,
      lastUpdated: new Date()
    };

    const stock = new Stock(stockData);
    await stock.save();

    return NextResponse.json({
      success: true,
      stock,
      message: "Stock entry created successfully"
    });
  } catch (error) {
    console.error("Error creating stock entry:", error);
    return NextResponse.json(
      { message: "Failed to create stock entry" },
      { status: 500 }
    );
  }
}
