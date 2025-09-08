import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Stock from '../../../../lib/models/Stock';

export async function POST(request) {
  try {
    await connectDB();

    // Find all stocks that have agent allocation movements
    const stocks = await Stock.find({
      'movements.type': 'agent_allocation'
    });


    const results = [];

    for (const stock of stocks) {
      
      // Get all agent allocation movements for this stock
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


      // Create agentStocks array
      const agentStocks = [];
      for (const [agentId, data] of Object.entries(agentTotals)) {
        const agentStock = {
          agentId: data.agentId,
          agentName: data.agentName,
          stockAllocated: data.totalAllocated,
          stockDelivered: 0,
          stockReturned: 0,
          stockInHand: data.totalAllocated, // Initially, all allocated stock is in hand
          status: "Active",
          lastUpdated: new Date()
        };
        agentStocks.push(agentStock);
      }

      // Update the stock document
      stock.agentStocks = agentStocks;
      stock.markModified('agentStocks');
      await stock.save();
      
      results.push({
        product: stock.product,
        agentStocks: agentStocks.length,
        totalAllocated: agentStocks.reduce((sum, as) => sum + as.stockAllocated, 0)
      });
      
    }


    return NextResponse.json({
      success: true,
      message: `Fixed ${stocks.length} stocks`,
      results
    });
    
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fix agent stocks',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
