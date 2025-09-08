import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Stock from '../../../../lib/models/Stock';

export async function POST(request) {
  try {
    await connectDB();
    
    const { stockId, agentId, agentName, quantity } = await request.json();


    const stock = await Stock.findById(stockId);
    
    if (!stock) {
      return NextResponse.json(
        { message: "Stock not found" },
        { status: 404 }
      );
    }


    // Test the allocation using direct MongoDB operations
    const quantityNum = parseFloat(quantity);
    
    // Try to update existing agent stock
    const updateResult = await Stock.updateOne(
      { 
        _id: stockId,
        'agentStocks.agentId': agentId 
      },
      {
        $inc: {
          stockGiven: quantityNum,
          'agentStocks.$[elem].stockAllocated': quantityNum,
          'agentStocks.$[elem].stockInHand': quantityNum
        },
        $set: {
          'agentStocks.$[elem].lastUpdated': new Date(),
          'agentStocks.$[elem].status': 'Active'
        }
      },
      {
        arrayFilters: [{ 'elem.agentId': agentId }]
      }
    );

    // If no existing agent stock found, add a new one
    if (updateResult.modifiedCount === 0) {
      await Stock.updateOne(
        { _id: stockId },
        {
          $push: {
            agentStocks: {
              agentId: agentId,
              agentName: agentName,
              stockAllocated: quantityNum,
              stockDelivered: 0,
              stockReturned: 0,
              stockInHand: quantityNum,
              status: "Active",
              lastUpdated: new Date()
            }
          },
          $inc: { stockGiven: quantityNum }
        }
      );
    }

    // Add movement record
    await Stock.updateOne(
      { _id: stockId },
      {
        $push: {
          movements: {
            type: "agent_allocation",
            quantity: quantityNum,
            reference: agentName,
            referenceId: agentId,
            notes: `Allocated ${quantityNum} ${stock.unit} to ${agentName}`,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }
      }
    );

    // Update stockAvailable
    await Stock.updateOne(
      { _id: stockId },
      {
        $set: {
          stockAvailable: stock.closingStock - (stock.stockGiven + quantityNum)
        }
      }
    );

    // Fetch the stock again to see the changes
    const updatedStock = await Stock.findById(stockId);


    return NextResponse.json({
      success: true,
      message: "Test allocation completed",
      before: {
        stockAvailable: stock.stockAvailable,
        stockGiven: stock.stockGiven,
        agentStocks: stock.agentStocks
      },
      after: {
        stockAvailable: updatedStock.stockAvailable,
        stockGiven: updatedStock.stockGiven,
        agentStocks: updatedStock.agentStocks
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        message: "Test allocation failed",
        error: error.message 
      },
      { status: 500 }
    );
  }
}
