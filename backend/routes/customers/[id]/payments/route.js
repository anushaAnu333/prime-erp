import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/mongodb";
import Payment from "../../../../../models/Payment";
import Sale from "../../../../../models/Sale";
import Customer from "../../../../../models/Customer";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const customerId = await params.id;

    // Get customer details
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Get all payments for this customer
    const payments = await Payment.find({ customerId })
      .sort({ paymentDate: -1 })
      .limit(50);

    // Get all sales for this customer
    const sales = await Sale.find({ customerId }).sort({ date: -1 }).limit(50);

    // Calculate payment summary from both Payment model and Sales payments array
    const totalPayments = payments
      .filter((p) => p.type === "Payment Received")
      .reduce((sum, p) => sum + p.amount, 0);

    const totalRefunds = payments
      .filter((p) => p.type === "Payment Refund")
      .reduce((sum, p) => sum + p.amount, 0);

    // Calculate payments from sales invoices
    const salesPayments = sales
      .filter((s) => s.payments && s.payments.length > 0)
      .flatMap((s) => s.payments)
      .reduce((sum, p) => sum + p.amountPaid, 0);

    const netPayments = totalPayments + salesPayments - totalRefunds;

    // Calculate sales summary
    const totalSales = sales
      .filter((s) => s.type === "Sale")
      .reduce((sum, s) => sum + s.total, 0);

    const totalReturns = sales
      .filter((s) => s.type === "Sale Return")
      .reduce((sum, s) => sum + s.total, 0);

    const netSales = totalSales - totalReturns;

    // Calculate outstanding amount
    const outstandingAmount = netSales - netPayments;

    return NextResponse.json({
      customer,
      payments,
      sales,
      summary: {
        totalSales,
        totalReturns,
        netSales,
        totalPayments,
        totalRefunds,
        netPayments,
        outstandingAmount,
        currentBalance: customer.currentBalance,
      },
    });
  } catch (error) {
    console.error("Error fetching customer payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer payments" },
      { status: 500 }
    );
  }
}
