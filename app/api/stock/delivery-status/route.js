import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Stock from '../../../../lib/models/Stock';

// PUT /api/stock/delivery-status - Update delivery guy status
export async function PUT(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { stockId, agentId, status } = body;
    
    if (!stockId || !agentId || !status) {
      return NextResponse.json(
        { message: "Stock ID, Agent ID, and status are required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['Active', 'In Progress', 'Completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Invalid status. Must be one of: Active, In Progress, Completed" },
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

    // Find the agent stock entry
    const agentStock = stock.agentStocks.find(
      (as) => as.agentId === agentId
    );

    if (!agentStock) {
      return NextResponse.json(
        { message: "Agent stock allocation not found" },
        { status: 404 }
      );
    }

    // Update the status
    agentStock.status = status;
    agentStock.lastUpdated = new Date();

    // Save the updated stock
    await stock.save();

    return NextResponse.json({
      success: true,
      message: "Delivery status updated successfully",
      stock: {
        _id: stock._id,
        product: stock.product,
        agentStock: agentStock
      }
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update delivery status" },
      { status: 500 }
    );
  }
}

// GET /api/stock/delivery-status - Get delivery status for a specific agent
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const stockId = searchParams.get('stockId');
    const agentId = searchParams.get('agentId');
    
    if (!stockId || !agentId) {
      return NextResponse.json(
        { message: "Stock ID and Agent ID are required" },
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

    const agentStock = stock.agentStocks.find(
      (as) => as.agentId === agentId
    );

    if (!agentStock) {
      return NextResponse.json(
        { message: "Agent stock allocation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      agentStock: {
        agentId: agentStock.agentId,
        agentName: agentStock.agentName,
        status: agentStock.status || (agentStock.stockInHand > 0 ? "Active" : "Completed"),
        stockAllocated: agentStock.stockAllocated,
        stockDelivered: agentStock.stockDelivered,
        stockReturned: agentStock.stockReturned,
        stockInHand: agentStock.stockInHand,
        lastUpdated: agentStock.lastUpdated
      }
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch delivery status" },
      { status: 500 }
    );
  }
}






