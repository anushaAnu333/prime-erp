import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Stock from "@/models/Stock";

// GET /api/stock/[id] - Get specific stock
export async function GET(request, { params }) {
  try {
    await connectDB();

    const stock = await Stock.findById(params.id).lean();

    if (!stock) {
      return NextResponse.json(
        { message: "Stock not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ stock });
  } catch (error) {
    console.error("Error fetching stock:", error);
    return NextResponse.json(
      { message: "Failed to fetch stock" },
      { status: 500 }
    );
  }
}

// PUT /api/stock/[id] - Update specific stock
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const body = await request.json();

    const stock = await Stock.findById(params.id);

    if (!stock) {
      return NextResponse.json(
        { message: "Stock not found" },
        { status: 404 }
      );
    }

    // Update allowed fields
    if (body.openingStock !== undefined) {
      stock.openingStock = body.openingStock;
    }

    if (body.minimumStock !== undefined) {
      stock.minimumStock = body.minimumStock;
    }

    if (body.expiryDate) {
      stock.expiryDate = body.expiryDate;
    }

    if (body.unit) {
      stock.unit = body.unit;
    }

    await stock.save();

    return NextResponse.json({
      message: "Stock updated successfully",
      stock,
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    return NextResponse.json(
      { message: "Failed to update stock" },
      { status: 500 }
    );
  }
}

// DELETE /api/stock/[id] - Delete specific stock
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const stock = await Stock.findById(params.id);

    if (!stock) {
      return NextResponse.json(
        { message: "Stock not found" },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    stock.isActive = false;
    await stock.save();

    return NextResponse.json({
      message: "Stock deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting stock:", error);
    return NextResponse.json(
      { message: "Failed to delete stock" },
      { status: 500 }
    );
  }
}
