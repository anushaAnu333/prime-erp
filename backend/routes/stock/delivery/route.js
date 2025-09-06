import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Stock from "@/models/Stock";

// POST /api/stock/delivery - Update agent delivery
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const { stockId, agentId, deliveredQuantity, type = "delivery" } = body;

    if (!stockId || !agentId || deliveredQuantity === undefined) {
      return NextResponse.json(
        { message: "Stock ID, agent ID, and quantity are required" },
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

    let result;

    if (type === "delivery") {
      // Update agent delivery
      await stock.updateAgentDelivery(agentId, deliveredQuantity);
      
      result = {
        message: "Delivery updated successfully",
        type: "delivery",
        quantity: deliveredQuantity,
      };
    } else if (type === "return") {
      // Handle sales return
      await stock.handleSalesReturn(agentId, deliveredQuantity);
      
      result = {
        message: "Sales return processed successfully",
        type: "return",
        quantity: deliveredQuantity,
      };
    } else {
      return NextResponse.json(
        { message: "Invalid type. Must be 'delivery' or 'return'" },
        { status: 400 }
      );
    }

    // Get updated agent stock
    const agentStock = stock.agentStocks.find(as => as.agentId.toString() === agentId.toString());

    return NextResponse.json({
      ...result,
      stock: {
        id: stock._id,
        product: stock.product,
        closingStock: stock.closingStock,
        stockGiven: stock.stockGiven,
        stockDelivered: stock.stockDelivered,
        salesReturns: stock.salesReturns,
        stockAvailable: stock.stockAvailable,
      },
      agentStock: agentStock ? {
        agentId: agentStock.agentId,
        agentName: agentStock.agentName,
        stockAllocated: agentStock.stockAllocated,
        stockDelivered: agentStock.stockDelivered,
        stockReturned: agentStock.stockReturned,
        stockInHand: agentStock.stockInHand,
        lastUpdated: agentStock.lastUpdated,
      } : null,
    });
  } catch (error) {
    console.error("Error updating delivery:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update delivery" },
      { status: 500 }
    );
  }
}

// GET /api/stock/delivery - Get agent delivery status
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

    // Calculate delivery statistics
    const deliveryStats = {
      totalAgents: agentStocks.length,
      totalAllocated: agentStocks.reduce((sum, as) => sum + as.stockAllocated, 0),
      totalDelivered: agentStocks.reduce((sum, as) => sum + as.stockDelivered, 0),
      totalReturned: agentStocks.reduce((sum, as) => sum + as.stockReturned, 0),
      totalInHand: agentStocks.reduce((sum, as) => sum + as.stockInHand, 0),
      deliveryRate: agentStocks.length > 0 
        ? (agentStocks.reduce((sum, as) => sum + as.stockDelivered, 0) / 
           agentStocks.reduce((sum, as) => sum + as.stockAllocated, 0) * 100).toFixed(2)
        : 0,
    };

    return NextResponse.json({
      stock: {
        id: stock._id,
        product: stock.product,
        companyId: stock.companyId,
        unit: stock.unit,
        stockGiven: stock.stockGiven,
        stockDelivered: stock.stockDelivered,
        salesReturns: stock.salesReturns,
        stockAvailable: stock.stockAvailable,
      },
      agentStocks,
      deliveryStats,
    });
  } catch (error) {
    console.error("Error fetching delivery status:", error);
    return NextResponse.json(
      { message: "Failed to fetch delivery status" },
      { status: 500 }
    );
  }
}
