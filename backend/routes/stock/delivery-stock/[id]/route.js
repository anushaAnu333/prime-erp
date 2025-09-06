import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Stock from "@/models/Stock";

// PUT /api/stock/delivery-stock/[id] - Complete delivery
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    const body = await request.json();
    
    // Parse the composite ID (stockId_agentId)
    const [stockId, agentId] = id.split('_');
    
    if (!stockId || !agentId) {
      return NextResponse.json(
        { message: "Invalid delivery ID format" },
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

    const agentStock = stock.agentStocks.find(
      as => as.agentId.toString() === agentId
    );

    if (!agentStock) {
      return NextResponse.json(
        { message: "Agent stock allocation not found" },
        { status: 404 }
      );
    }

    // Mark all remaining stock as delivered (complete the delivery)
    const remainingStock = agentStock.stockInHand;
    
    if (remainingStock > 0) {
      agentStock.stockDelivered += remainingStock;
      agentStock.stockInHand = 0;
      agentStock.lastUpdated = new Date();
      
      // Update overall stock
      stock.stockDelivered += remainingStock;
      stock.stockAvailable = stock.stockGiven - stock.stockDelivered + stock.salesReturns;
      
      await stock.save();
    }

    return NextResponse.json({
      message: "Delivery completed successfully",
      stock: {
        id: stock._id,
        product: stock.product,
        stockDelivered: stock.stockDelivered,
        stockAvailable: stock.stockAvailable,
      },
      agentStock: {
        agentId: agentStock.agentId,
        agentName: agentStock.agentName,
        stockDelivered: agentStock.stockDelivered,
        stockInHand: agentStock.stockInHand,
        lastUpdated: agentStock.lastUpdated,
      }
    });
  } catch (error) {
    console.error("Error completing delivery:", error);
    return NextResponse.json(
      { message: "Failed to complete delivery" },
      { status: 500 }
    );
  }
}



