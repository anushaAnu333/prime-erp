import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Stock from '../../../../lib/models/Stock';

export async function POST(request) {
  try {
    await connectDB();
    
    // Find the chapati stock
    const stock = await Stock.findOne({ product: 'chapati' });
    
    if (!stock) {
      return NextResponse.json(
        { message: "Chapati stock not found" },
        { status: 404 }
      );
    }


    // Get all agent allocation movements
    const agentAllocations = stock.movements.filter(m => m.type === 'agent_allocation');
    
    // Group by agentId and sum quantities
    const agentTotals = {};
    agentAllocations.forEach(allocation => {
      const agentId = allocation.referenceId;
      if (!agentTotals[agentId]) {
        agentTotals[agentId] = {
          agentId,
          agentName: allocation.reference,
          totalAllocated: 0
        };
      }
      agentTotals[agentId].totalAllocated += allocation.quantity;
    });


    // Update the agentStocks array directly using MongoDB operations
    const agentStocks = [];
    for (const [agentId, data] of Object.entries(agentTotals)) {
      agentStocks.push({
        agentId: data.agentId,
        agentName: data.agentName,
        stockAllocated: data.totalAllocated,
        stockDelivered: 0,
        stockReturned: 0,
        stockInHand: data.totalAllocated, // Initially, all allocated stock is in hand
        status: "Active",
        lastUpdated: new Date()
      });
    }

    // Update the stock document
    const result = await Stock.updateOne(
      { _id: stock._id },
      { 
        $set: { 
          agentStocks: agentStocks,
          updatedAt: new Date()
        } 
      }
    );


    // Fetch the updated stock
    const updatedStock = await Stock.findById(stock._id);

    return NextResponse.json({
      success: true,
      message: "Chapati stock fixed successfully",
      before: {
        stockGiven: stock.stockGiven,
        agentStocks: stock.agentStocks
      },
      after: {
        stockGiven: updatedStock.stockGiven,
        agentStocks: updatedStock.agentStocks
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fix chapati stock',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
