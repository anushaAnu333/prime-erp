import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Stock from '../../../../lib/models/Stock';

// GET /api/stock/[id] - Get stock by ID
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const stock = await Stock.findById(id);
    
    if (!stock) {
      return NextResponse.json(
        { message: "Stock entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      stock
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch stock entry" },
      { status: 500 }
    );
  }
}

// PUT /api/stock/[id] - Update stock entry
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const body = await request.json();
    const stockData = {
      ...body,
      closingStock: (body.openingStock || 0) + (body.totalPurchases || 0) - (body.totalSales || 0),
      stockAvailable: (body.openingStock || 0) + (body.totalPurchases || 0) - (body.totalSales || 0) - (body.stockGiven || 0),
      isLowStock: (body.openingStock || 0) < (body.minimumStock || 10),
      isExpired: body.expiryDate ? new Date(body.expiryDate) < new Date() : false,
      lastUpdated: new Date()
    };

    const stock = await Stock.findByIdAndUpdate(id, stockData, { new: true });
    
    if (!stock) {
      return NextResponse.json(
        { message: "Stock entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      stock,
      message: "Stock entry updated successfully"
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update stock entry" },
      { status: 500 }
    );
  }
}

// DELETE /api/stock/[id] - Delete stock entry
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const stock = await Stock.findByIdAndDelete(id);
    
    if (!stock) {
      return NextResponse.json(
        { message: "Stock entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Stock entry deleted successfully"
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete stock entry" },
      { status: 500 }
    );
  }
}