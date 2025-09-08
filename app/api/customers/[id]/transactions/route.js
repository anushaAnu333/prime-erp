import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/mongodb';
import Sale from '../../../../../lib/models/Sale';

// GET /api/customers/[id]/transactions - Get customer transactions
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    
    const skip = (page - 1) * limit;

    // Get all sales for this customer with payments
    const sales = await Sale.find({
      customerId: id,
      deliveryStatus: { $ne: "Cancelled" }
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Sale.countDocuments({
      customerId: id,
      deliveryStatus: { $ne: "Cancelled" }
    });

    // Flatten all transactions from all sales
    const transactions = [];
    sales.forEach(sale => {
      if (sale.payments && sale.payments.length > 0) {
        sale.payments.forEach(payment => {
          transactions.push({
            id: `${sale._id}_${payment._id}`,
            saleId: sale._id,
            invoiceNumber: sale.invoiceNo,
            invoiceDate: sale.date,
            paymentDate: payment.paymentDate,
            paymentMode: payment.paymentMode,
            amountPaid: payment.amountPaid,
            referenceNumber: payment.referenceNumber,
            notes: payment.notes,
            totalAmount: sale.total,
            paymentStatus: sale.paymentStatus
          });
        });
      }
    });

    // Sort transactions by payment date (newest first)
    transactions.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

    return NextResponse.json({
      transactions,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch customer transactions" },
      { status: 500 }
    );
  }
}