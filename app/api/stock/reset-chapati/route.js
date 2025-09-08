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


    // Reset the stock to initial state
    const result = await Stock.updateOne(
      { _id: stock._id },
      { 
        $set: { 
          stockGiven: 0,
          stockAvailable: stock.closingStock,
          agentStocks: [],
          updatedAt: new Date()
        } 
      }
    );


    // Fetch the updated stock
    const updatedStock = await Stock.findById(stock._id);

    return NextResponse.json({
      success: true,
      message: "Chapati stock reset successfully",
      before: {
        stockGiven: stock.stockGiven,
        stockAvailable: stock.stockAvailable,
        agentStocks: stock.agentStocks.length
      },
      after: {
        stockGiven: updatedStock.stockGiven,
        stockAvailable: updatedStock.stockAvailable,
        agentStocks: updatedStock.agentStocks.length
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to reset chapati stock',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
