import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Purchase from "@/lib/models/Purchase";

// GET /api/purchases/:id - Get single purchase
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const purchase = await Purchase.findById(id);
    if (!purchase) {
      return NextResponse.json(
        { message: "Purchase not found" },
        { status: 404 }
      );
    }

    // Format response to match frontend expectations
    const formattedPurchase = {
      id: purchase._id.toString(),
      _id: purchase._id.toString(),
      purchaseNumber: purchase.purchaseNumber,
      date: purchase.date,
      vendor: {
        name: purchase.vendorName,
        vendorName: purchase.vendorName,
        phoneNumber: purchase.vendorDetails?.phone,
        address: purchase.vendorDetails?.address,
      },
      items: purchase.items || [],
      total: purchase.total,
      subtotal: purchase.items
        ? purchase.items.reduce(
            (sum, item) => sum + (item.taxableValue || 0),
            0
          )
        : 0,
      totalGST: purchase.items
        ? purchase.items.reduce((sum, item) => sum + (item.gst || 0), 0)
        : 0,
      discount: purchase.discount || 0,
      supplierInvoiceNumber: purchase.supplierInvoiceNumber,
      supplierInvoiceDate: purchase.supplierInvoiceDate,
      status: purchase.status || "Pending",
      type: purchase.purchaseType || "Purchase",
      againstPurchaseId: purchase.againstPurchaseId,
      paymentStatus: purchase.paymentStatus || "Pending",
      paymentMode: purchase.paymentMode,
      amountPaid: purchase.amountPaid || 0,
      deliveryStatus: purchase.deliveryStatus || "Pending",
      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt,
    };

    return NextResponse.json({ purchase: formattedPurchase });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/purchases/:id - Update purchase
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const purchase = await Purchase.findByIdAndUpdate(id, await request.json(), {
      new: true,
    });
    if (!purchase) {
      return NextResponse.json(
        { message: "Purchase not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ purchase });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/purchases/:id - Delete purchase
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const purchase = await Purchase.findByIdAndDelete(id);
    if (!purchase) {
      return NextResponse.json(
        { message: "Purchase not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Purchase deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}