import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Stock from "@/models/Stock";

// GET /api/stock/delivery-stock - Get delivery stock data
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const deliveryGuyId = searchParams.get("deliveryGuyId");
    const status = searchParams.get("status");
    const date = searchParams.get("date");

    // Build query for stocks with agent allocations
    let query = { 
      isActive: true,
      "agentStocks.0": { $exists: true } // Only stocks that have agent allocations
    };

    // Get all stocks with agent allocations
    const stocks = await Stock.find(query)
      .sort({ companyId: 1, product: 1 })
      .lean();

    // Transform data to delivery stock format
    const deliveryStocks = [];
    const deliveryGuyMap = new Map();

    stocks.forEach(stock => {
      stock.agentStocks.forEach(agentStock => {
        // Apply filters
        if (deliveryGuyId && agentStock.agentId.toString() !== deliveryGuyId) {
          return;
        }

        if (status && status !== "All Status") {
          // For now, we'll consider all as "Active" since we don't have status field
          if (status === "Completed") return;
        }

        if (date) {
          const stockDate = new Date(agentStock.lastUpdated);
          const filterDate = new Date(date);
          if (stockDate.toDateString() !== filterDate.toDateString()) {
            return;
          }
        }

        const deliveryStock = {
          _id: `${stock._id}_${agentStock.agentId}`,
          deliveryGuyId: agentStock.agentId,
          deliveryGuyName: agentStock.agentName,
          product: stock.product,
          companyId: stock.companyId,
          unit: stock.unit,
          openingStock: agentStock.stockAllocated,
          stockReceived: agentStock.stockAllocated,
          stockDelivered: agentStock.stockDelivered,
          stockReturned: agentStock.stockReturned,
          closingStock: agentStock.stockInHand,
          date: agentStock.lastUpdated,
          status: agentStock.stockInHand > 0 ? "Active" : "Completed"
        };

        deliveryStocks.push(deliveryStock);

        // Track delivery guys for summary
        if (!deliveryGuyMap.has(agentStock.agentId)) {
          deliveryGuyMap.set(agentStock.agentId, {
            id: agentStock.agentId,
            name: agentStock.agentName,
            totalStockReceived: 0,
            totalStockDelivered: 0,
            totalStockReturned: 0,
            totalClosingStock: 0
          });
        }

        const deliveryGuy = deliveryGuyMap.get(agentStock.agentId);
        deliveryGuy.totalStockReceived += agentStock.stockAllocated;
        deliveryGuy.totalStockDelivered += agentStock.stockDelivered;
        deliveryGuy.totalStockReturned += agentStock.stockReturned;
        deliveryGuy.totalClosingStock += agentStock.stockInHand;
      });
    });

    // Calculate summary
    const deliverySummary = {
      totalDeliveryGuys: deliveryGuyMap.size,
      totalStockReceived: deliveryStocks.reduce((sum, ds) => sum + ds.stockReceived, 0),
      totalStockDelivered: deliveryStocks.reduce((sum, ds) => sum + ds.stockDelivered, 0),
      totalStockReturned: deliveryStocks.reduce((sum, ds) => sum + ds.stockReturned, 0),
      totalClosingStock: deliveryStocks.reduce((sum, ds) => sum + ds.closingStock, 0),
    };

    return NextResponse.json({
      deliveryStocks,
      summary: deliverySummary,
    });
  } catch (error) {
    console.error("Error fetching delivery stock data:", error);
    return NextResponse.json(
      { message: "Failed to fetch delivery stock data" },
      { status: 500 }
    );
  }
}



