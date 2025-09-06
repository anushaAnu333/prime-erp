import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/mongodb";
import Sale from "../../../../../models/Sale";

export async function POST(request, { params }) {
  try {
    await connectDB();

    const saleId = await params.id;
    const body = await request.json();
    const { paymentMode, amountPaid, paymentDate, referenceNumber, notes } =
      body;

    // Validate required fields
    if (!paymentMode || !amountPaid) {
      return NextResponse.json(
        { error: "Payment mode and amount are required" },
        { status: 400 }
      );
    }

    // Find the sale
    const sale = await Sale.findById(saleId);
    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    // Create new payment object
    const newPayment = {
      paymentMode,
      amountPaid: parseFloat(amountPaid),
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      referenceNumber: referenceNumber || "",
      notes: notes || "",
    };

    // Add payment to the sale
    sale.payments.push(newPayment);

    // Update payment status based on total payments
    const totalPaid = sale.payments.reduce((sum, p) => sum + p.amountPaid, 0);
    if (totalPaid >= sale.total) {
      sale.paymentStatus = "Paid";
    } else if (totalPaid > 0) {
      sale.paymentStatus = "Partial";
    } else {
      sale.paymentStatus = "Pending";
    }

    await sale.save();

    return NextResponse.json({
      sale,
      message: "Payment added successfully",
      totalPaid,
      remainingAmount: sale.total - totalPaid,
    });
  } catch (error) {
    console.error("Error adding payment to sale:", error);
    return NextResponse.json(
      { error: "Failed to add payment to sale" },
      { status: 500 }
    );
  }
}
