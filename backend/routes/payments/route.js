import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Payment from "../../../models/Payment";
import Customer from "../../../models/Customer";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const companyId = searchParams.get("companyId");

    let query = {};

    if (customerId) {
      query.customerId = customerId;
    }

    if (companyId) {
      query.companyId = companyId;
    }

    const payments = await Payment.find(query)
      .sort({ paymentDate: -1 })
      .populate("customerId", "customerCode name shopName");

    return NextResponse.json({ payments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      customerId,
      customerName,
      amount,
      paymentMode,
      paymentDate,
      referenceNumber,
      notes,
      companyId,
      relatedSaleIds,
      type = "Payment Received",
    } = body;

    // Validate required fields
    if (!customerId || !customerName || !amount || !paymentMode || !companyId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create payment
    const payment = new Payment({
      customerId,
      customerName,
      amount,
      paymentMode,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      referenceNumber,
      notes,
      companyId,
      relatedSaleIds: relatedSaleIds || [],
      type,
    });

    await payment.save();

    // Update customer balance
    const customer = await Customer.findById(customerId);
    if (customer) {
      if (type === "Payment Received") {
        customer.currentBalance = Math.max(0, customer.currentBalance - amount);
      } else if (type === "Payment Refund") {
        customer.currentBalance += amount;
      }
      await customer.save();
    }

    return NextResponse.json(
      {
        payment,
        message: "Payment recorded successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment", details: error.message },
      { status: 500 }
    );
  }
}
