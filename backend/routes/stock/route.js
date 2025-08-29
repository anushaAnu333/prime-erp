import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Stock from "@/models/Stock";

// GET /api/stock - Get stock data with filtering
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const company = searchParams.get("company") || "";
    const product = searchParams.get("product") || "";
    const lowStock = searchParams.get("lowStock") === "true";
    const expired = searchParams.get("expired") === "true";

    // Build query
    let query = { isActive: true };

    if (company) {
      query.companyId = company;
    }

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
      .sort({ companyId: 1, product: 1 })
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

// POST /api/stock - Create or update stock
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate required fields
    const requiredFields = ["product", "companyId", "unit", "expiryDate"];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Check if stock already exists for this product and company
    const existingStock = await Stock.findOne({
      product: body.product,
      companyId: body.companyId,
    });

    if (existingStock) {
      return NextResponse.json(
        { message: "Stock already exists for this product and company" },
        { status: 400 }
      );
    }

    // Create new stock
    const stock = new Stock({
      product: body.product,
      companyId: body.companyId,
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

// PUT /api/stock - Update stock
export async function PUT(request) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.stockId) {
      return NextResponse.json(
        { message: "Stock ID is required" },
        { status: 400 }
      );
    }

    const stock = await Stock.findById(body.stockId);

    if (!stock) {
      return NextResponse.json(
        { message: "Stock not found" },
        { status: 404 }
      );
    }

    // Update allowed fields
    if (body.openingStock !== undefined) {
      stock.openingStock = body.openingStock;
    }

    if (body.minimumStock !== undefined) {
      stock.minimumStock = body.minimumStock;
    }

    if (body.expiryDate) {
      stock.expiryDate = body.expiryDate;
    }

    if (body.unit) {
      stock.unit = body.unit;
    }

    await stock.save();

    return NextResponse.json(
      { message: "Stock updated successfully", stock }
    );
  } catch (error) {
    console.error("Error updating stock:", error);
    return NextResponse.json(
      { message: "Failed to update stock" },
      { status: 500 }
    );
  }
}
