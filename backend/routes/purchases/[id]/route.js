import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import Purchase from "../../../../models/Purchase";

// GET /api/purchases/[id] - Get specific purchase
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    const purchase = await Purchase.findById(id)
      .populate("createdBy", "name email")
      .populate("againstPurchaseId", "purchaseNumber vendorName");

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(purchase);
  } catch (error) {
    console.error("Error fetching purchase:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchase" },
      { status: 500 }
    );
  }
}

// PUT /api/purchases/[id] - Update purchase
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const body = await request.json();

    const purchase = await Purchase.findById(id);

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    // Update payment and delivery status
    if (body.paymentStatus !== undefined) {
      purchase.paymentStatus = body.paymentStatus;
    }
    if (body.paymentMode !== undefined) {
      purchase.paymentMode = body.paymentMode;
    }
    if (body.amountPaid !== undefined) {
      purchase.amountPaid = body.amountPaid;
    }
    if (body.deliveryStatus !== undefined) {
      purchase.deliveryStatus = body.deliveryStatus;
    }

    await purchase.save();

    return NextResponse.json(purchase);
  } catch (error) {
    console.error("Error updating purchase:", error);
    return NextResponse.json(
      { error: "Failed to update purchase" },
      { status: 500 }
    );
  }
}

// DELETE /api/purchases/[id] - Delete purchase (soft delete)
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    const purchase = await Purchase.findById(id);

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    // Soft delete by updating status
    purchase.status = "Cancelled";
    await purchase.save();

    return NextResponse.json({ message: "Purchase cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling purchase:", error);
    return NextResponse.json(
      { error: "Failed to cancel purchase" },
      { status: 500 }
    );
  }
}
