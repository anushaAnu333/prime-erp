import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Stock from "@/lib/models/Stock";

// POST /api/stock/allocate - Stock allocation route
export async function POST(request) {
  try {
    await connectDB();
    
    const { stockId, allocations } = await request.json();

    if (!stockId || !allocations || !Array.isArray(allocations)) {
      return NextResponse.json(
        {
          message: "Stock ID and allocations array are required"
        },
        { status: 400 }
      );
    }

    const stock = await Stock.findById(stockId);

    if (!stock) {
      return NextResponse.json(
        {
          message: "Stock not found"
        },
        { status: 404 }
      );
    }

    // Validate total allocation doesn't exceed available stock
    const totalAllocation = allocations.reduce((sum, alloc) => sum + parseFloat(alloc.quantity || 0), 0);
    
    if (totalAllocation > stock.stockAvailable) {
      return NextResponse.json(
        {
          message: `Insufficient stock. Available: ${stock.stockAvailable} ${stock.unit}, Requested: ${totalAllocation} ${stock.unit}`
        },
        { status: 400 }
      );
    }

    // Process each allocation
    const results = [];
    
    for (const allocation of allocations) {
      try {
        
        const quantity = parseFloat(allocation.quantity || 0);
        if (quantity <= 0) {
          results.push({
            agentId: allocation.agentId,
            agentName: allocation.agentName,
            quantity: allocation.quantity,
            status: "skipped",
            message: "Quantity is zero or invalid"
          });
          continue;
        }

        // Use direct MongoDB update instead of the model method
        const updateResult = await Stock.updateOne(
          { 
            _id: stockId,
            'agentStocks.agentId': allocation.agentId 
          },
          {
            $inc: {
              stockGiven: quantity,
              'agentStocks.$[elem].stockAllocated': quantity,
              'agentStocks.$[elem].stockInHand': quantity
            },
            $set: {
              'agentStocks.$[elem].lastUpdated': new Date(),
              'agentStocks.$[elem].status': 'Active'
            }
          },
          {
            arrayFilters: [{ 'elem.agentId': allocation.agentId }]
          }
        );

        // If no existing agent stock found, add a new one
        if (updateResult.modifiedCount === 0) {
          await Stock.updateOne(
            { _id: stockId },
            {
              $push: {
                agentStocks: {
                  agentId: allocation.agentId,
                  agentName: allocation.agentName,
                  stockAllocated: quantity,
                  stockDelivered: 0,
                  stockReturned: 0,
                  stockInHand: quantity,
                  status: "Active",
                  lastUpdated: new Date()
                }
              },
              $inc: { stockGiven: quantity }
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
                quantity,
                reference: allocation.agentName,
                referenceId: allocation.agentId,
                notes: `Allocated ${quantity} ${stock.unit} to ${allocation.agentName}`,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            }
          }
        );

        // Update stockAvailable (we'll do this at the end for all allocations)
        // await Stock.updateOne(
        //   { _id: stockId },
        //   {
        //     $set: {
        //       stockAvailable: stock.closingStock - (stock.stockGiven + quantity)
        //     }
        //   }
        // );
        
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

    // Update stockAvailable after all allocations are processed
    const totalAllocated = allocations.reduce((sum, alloc) => sum + parseFloat(alloc.quantity || 0), 0);
    await Stock.updateOne(
      { _id: stockId },
      {
        $set: {
          stockAvailable: stock.closingStock - (stock.stockGiven + totalAllocated)
        }
      }
    );

    // Fetch the final updated stock
    const finalStock = await Stock.findById(stockId);

    return NextResponse.json({
      message: "Stock allocation completed",
      results,
      stock: {
        id: finalStock._id,
        product: finalStock.product,
        closingStock: finalStock.closingStock,
        stockGiven: finalStock.stockGiven,
        stockAvailable: finalStock.stockAvailable,
        agentStocks: finalStock.agentStocks,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to allocate stock"
      },
      { status: 500 }
    );
  }
}
