import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Sale from '../../../../lib/models/Sale';

// GET /api/sales/[id] - Get single sale
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const sale = await Sale.findById(id).populate("customerId");
    if (!sale) {
      return NextResponse.json(
        { message: "Sale not found" },
        { status: 404 }
      );
    }

    // Format response to match frontend expectations
    const formattedSale = {
      id: sale._id.toString(),
      _id: sale._id.toString(),
      invoiceNumber: sale.invoiceNo,
      invoiceDate: sale.date,
      customer: {
        name: sale.customerName,
        shopName: sale.shopName,
        phoneNumber: sale.phoneNumber,
        address: sale.customerAddress,
      },
      items: sale.items || [],
      finalAmount: sale.total,
      subtotal: sale.items ? sale.items.reduce((sum, item) => sum + (item.taxableValue || 0), 0) : 0,
      totalGST: sale.items ? sale.items.reduce((sum, item) => sum + (item.gst || 0), 0) : 0,
      discount: sale.discount || 0,
      deliveryAgent: sale.deliveryAgent,
      companyId: sale.companyId,
      paymentStatus: sale.paymentStatus || "Pending",
      deliveryStatus: sale.deliveryStatus || "Pending",
      type: sale.type || "Sale",
      originalSaleId: sale.originalSaleId,
      notes: sale.notes || "",
      paymentMode: sale.paymentMode,
      amountPaid: sale.amountPaid,
      payments: sale.payments || [],
      referenceNumber: sale.referenceNumber,
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt,
    };

    return NextResponse.json({ sale: formattedSale });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/sales/[id] - Update sale
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    // Parse JSON with error handling
    let updateData;
    try {
      updateData = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        { message: "Invalid JSON data" },
        { status: 400 }
      );
    }
    
    const sale = await Sale.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!sale) {
      return NextResponse.json(
        { message: "Sale not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ sale });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/sales/[id] - Delete sale
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const sale = await Sale.findByIdAndDelete(id);
    if (!sale) {
      return NextResponse.json(
        { message: "Sale not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Sale deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}