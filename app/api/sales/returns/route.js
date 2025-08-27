import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import Sale from "../../../../models/Sale";
import { verifyToken } from "../../../../lib/auth";

export async function POST(request) {
  try {
    // Verify authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const {
      againstSaleId,
      customerName,
      companyId,
      items,
      discount = 0,
    } = body;

    // Validate required fields
    if (
      !againstSaleId ||
      !customerName ||
      !companyId ||
      !items ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the original sale to copy details
    const originalSale = await Sale.findById(againstSaleId);
    if (!originalSale) {
      return NextResponse.json(
        { error: "Original sale not found" },
        { status: 404 }
      );
    }

    // Calculate totals for return items
    const returnItems = items.map((item) => {
      const qty = parseFloat(item.qty);
      const rate = parseFloat(item.rate);
      const taxableValue = qty * rate;
      const gstRate = 5; // Default GST rate
      const gst = (taxableValue * gstRate) / 100;
      const invoiceValue = taxableValue + gst;

      return {
        product: item.product,
        expiryDate: new Date(item.expiryDate),
        qty: qty,
        rate: rate,
        taxableValue: taxableValue,
        gst: gst,
        invoiceValue: invoiceValue,
        gstRate: gstRate,
        unit: "kg",
      };
    });

    // Calculate total
    const subtotal = returnItems.reduce(
      (sum, item) => sum + item.invoiceValue,
      0
    );
    const discountAmount = (subtotal * parseFloat(discount)) / 100;
    const total = subtotal - discountAmount;

    // Generate return number
    const lastReturn = await Sale.findOne({ type: "Sale Return" }).sort({
      invoiceNo: -1,
    });
    const lastNumber = lastReturn
      ? parseInt(lastReturn.invoiceNo.replace("SR", ""))
      : 0;
    const returnNumber = `SR${String(lastNumber + 1).padStart(4, "0")}`;

    // Create the sales return
    const salesReturn = new Sale({
      invoiceNo: returnNumber,
      date: new Date(),
      customerId: originalSale.customerId,
      customerName: customerName,
      customerAddress: originalSale.customerAddress,
      shopName: originalSale.shopName,
      phoneNumber: originalSale.phoneNumber,
      items: returnItems,
      discount: discountAmount,
      total: total,
      notes: `Return against ${originalSale.invoiceNo}`,
      deliveryAgent: originalSale.deliveryAgent,
      companyId: companyId,
      type: "Sale Return",
      originalSaleId: againstSaleId,
    });

    await salesReturn.save();

    return NextResponse.json({
      message: "Sales return created successfully",
      return: salesReturn,
    });
  } catch (error) {
    console.error("Error creating sales return:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
