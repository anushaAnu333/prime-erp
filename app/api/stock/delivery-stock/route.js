import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Stock from '../../../../lib/models/Stock';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const deliveryGuyId = searchParams.get('deliveryGuyId');
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    
    // Build query for stocks that have agent allocations
    let query = { 'agentStocks.0': { $exists: true } };
    
    // If filtering by delivery guy
    if (deliveryGuyId) {
      query['agentStocks.agentId'] = deliveryGuyId;
    }
    
    // If filtering by status
    if (status) {
      query['agentStocks.status'] = status;
    }
    
    const stocks = await Stock.find(query).sort({ product: 1 });
    
    
    // Transform the data to match the expected format
    const deliveryStocks = [];
    
    stocks.forEach(stock => {
      if (stock.agentStocks && stock.agentStocks.length > 0) {
        stock.agentStocks.forEach(agentStock => {
          // Apply filters
          if (deliveryGuyId && agentStock.agentId !== deliveryGuyId) return;
          if (status && agentStock.status !== status) return;
          if (date) {
            const stockDate = new Date(agentStock.lastUpdated).toISOString().split('T')[0];
            if (stockDate !== date) return;
          }
          
          deliveryStocks.push({
            _id: `${stock._id}_${agentStock.agentId}`,
            product: stock.product,
            unit: stock.unit,
            deliveryGuyId: agentStock.agentId,
            deliveryGuyName: agentStock.agentName,
            stockAllocated: agentStock.stockAllocated || 0,
            stockDelivered: agentStock.stockDelivered || 0,
            stockReturned: agentStock.stockReturned || 0,
            stockInHand: agentStock.stockInHand || 0,
            lastUpdated: agentStock.lastUpdated || stock.updatedAt,
            status: agentStock.status || "Active"
          });
        });
      }
    });
    
    // Calculate summary
    const summary = {
      totalDeliveryGuys: new Set(deliveryStocks.map(item => item.deliveryGuyId)).size,
      totalStockAllocated: deliveryStocks.reduce((sum, item) => sum + item.stockAllocated, 0),
      totalStockDelivered: deliveryStocks.reduce((sum, item) => sum + item.stockDelivered, 0),
      totalStockReturned: deliveryStocks.reduce((sum, item) => sum + item.stockReturned, 0),
      totalStockInHand: deliveryStocks.reduce((sum, item) => sum + item.stockInHand, 0),
      activeDeliveries: deliveryStocks.filter(item => item.status === "Active").length
    };

    return NextResponse.json({
      success: true,
      deliveryStocks,
      summary
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch delivery stock data' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/api/stock/delivery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { message: 'ID is required' },
        { status: 400 }
      );
    }
    
    const response = await fetch(`${BACKEND_URL}/api/stock/delivery-stock/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

