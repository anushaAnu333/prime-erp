import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Stock from "@/models/Stock";

// POST /api/stock/allocate - Allocate stock to agents
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const { stockId, allocations } = body;

    if (!stockId || !allocations || !Array.isArray(allocations)) {
      return NextResponse.json(
        { message: "Stock ID and allocations array are required" },
        { status: 400 }
      );
    }

    const stock = await Stock.findById(stockId);

    if (!stock) {
      return NextResponse.json(
        { message: "Stock not found" },
        { status: 404 }
      );
    }

    // Validate total allocation doesn't exceed available stock
    const totalAllocation = allocations.reduce((sum, alloc) => sum + alloc.quantity, 0);
    
    if (totalAllocation > stock.closingStock) {
      return NextResponse.json(
        { 
          message: `Insufficient stock. Available: ${stock.closingStock} ${stock.unit}, Requested: ${totalAllocation} ${stock.unit}` 
        },
        { status: 400 }
      );
    }

    // Process each allocation
    const results = [];
    
    for (const allocation of allocations) {
      try {
        await stock.allocateToAgent(
          allocation.agentId,
          allocation.agentName,
          allocation.quantity
        );
        
        results.push({
          agentId: allocation.agentId,
          agentName: allocation.agentName,
          quantity: allocation.quantity,
          status: "success",
        });
      } catch (error) {
        results.push({
          agentId: allocation.agentId,
          agentName: allocation.agentName,
          quantity: allocation.quantity,
          status: "failed",
          error: error.message,
        });
      }
    }

    // Refresh stock data
    await stock.save();

    return NextResponse.json({
      message: "Stock allocation completed",
      results,
      stock: {
        id: stock._id,
        product: stock.product,
        closingStock: stock.closingStock,
        stockGiven: stock.stockGiven,
        stockAvailable: stock.stockAvailable,
      },
    });
  } catch (error) {
    console.error("Error allocating stock:", error);
    return NextResponse.json(
      { message: "Failed to allocate stock" },
      { status: 500 }
    );
  }
}

// GET /api/stock/allocate - Get agent stock allocations
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const stockId = searchParams.get("stockId");
    const agentId = searchParams.get("agentId");

    if (!stockId) {
      return NextResponse.json(
        { message: "Stock ID is required" },
        { status: 400 }
      );
    }

    const stock = await Stock.findById(stockId);

    if (!stock) {
      return NextResponse.json(
        { message: "Stock not found" },
        { status: 404 }
      );
    }

    let agentStocks = stock.agentStocks;

    // Filter by specific agent if provided
    if (agentId) {
      agentStocks = agentStocks.filter(as => as.agentId.toString() === agentId);
    }

    return NextResponse.json({
      stock: {
        id: stock._id,
        product: stock.product,
        companyId: stock.companyId,
        unit: stock.unit,
        closingStock: stock.closingStock,
        stockGiven: stock.stockGiven,
        stockAvailable: stock.stockAvailable,
      },
      agentStocks,
    });
  } catch (error) {
    console.error("Error fetching agent allocations:", error);
    return NextResponse.json(
      { message: "Failed to fetch agent allocations" },
      { status: 500 }
    );
  }
}
