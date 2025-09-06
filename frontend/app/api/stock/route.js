import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Stock from "@/lib/models/Stock";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const product = searchParams.get("product") || "";
    const lowStock = searchParams.get("lowStock") === "true";
    const expired = searchParams.get("expired") === "true";

    // Build query
    let query = { isActive: true };

    if (product) {
      query.product = product;
    }

    if (lowStock) {
      query.isLowStock = true;
    }

    if (expired) {
      query.isExpired = true;
    }

    // Get stock data
    const stocks = await Stock.find(query)
      .sort({ product: 1 })
      .lean();

    // Calculate summary statistics
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
      expiredCount: stocks.filter(stock => stock.isExpired).length,
    };

    return NextResponse.json({
      stocks,
      summary,
    });
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return NextResponse.json(
      { message: "Failed to fetch stock data" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate required fields
    const requiredFields = ["product", "unit", "expiryDate"];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Check if stock already exists for this product
    const existingStock = await Stock.findOne({
      product: body.product,
    });

    if (existingStock) {
      return NextResponse.json(
        { message: "Stock already exists for this product" },
        { status: 400 }
      );
    }

    // Create new stock
    const stock = new Stock({
      product: body.product,
      openingStock: body.openingStock || 0,
      unit: body.unit,
      expiryDate: body.expiryDate,
      minimumStock: body.minimumStock || 10,
    });

    await stock.save();

    return NextResponse.json(
      { message: "Stock created successfully", stock },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating stock:", error);
    return NextResponse.json(
      { message: "Failed to create stock" },
      { status: 500 }
    );
  }
}
