import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import Purchase from "../../../../models/Purchase";
import Vendor from "../../../../models/Vendor";
import {
  calculatePurchaseTotals,
  generatePurchaseNumber,
} from "../../../../lib/calculations";
import { updateStock, updateVendorBalance } from "../../../../lib/stockManager";

// POST /api/purchases/returns - Create purchase return
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      againstPurchaseId,
      vendorName,
      companyId,
      items,
      discount = 0,
    } = body;

    // Validate required fields
    if (!againstPurchaseId || !vendorName || !companyId || !items) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get original purchase for reference
    const originalPurchase = await Purchase.findById(againstPurchaseId);

    if (!originalPurchase) {
      return NextResponse.json(
        { error: "Original purchase not found" },
        { status: 404 }
      );
    }

    if (originalPurchase.purchaseType !== "Purchase") {
      return NextResponse.json(
        { error: "Can only return against purchase invoices, not returns" },
        { status: 400 }
      );
    }

    // Get vendor details
    const vendor = await Vendor.findOne({
      vendorName: vendorName.trim(),
      companyId,
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Calculate totals for each item
    const calculatedItems = items.map((item) => {
      const calculations = calculatePurchaseTotals(
        item.product,
        item.qty,
        item.rate,
        0 // No discount at item level
      );

      return {
        ...item,
        ...calculations,
        expiryDate: new Date(item.expiryDate),
      };
    });

    // Calculate total return value
    const totalReturnValue = calculatedItems.reduce(
      (sum, item) => sum + item.invoiceValue,
      0
    );
    const finalTotal = totalReturnValue - discount;

    // Generate return number
    const returnNumber = (await generatePurchaseNumber(companyId)) + "-RET";

    // Create purchase return record
    const purchaseReturn = new Purchase({
      purchaseNumber: returnNumber,
      date: new Date(),
      vendorName: vendor.vendorName,
      vendorDetails: {
        name: vendor.vendorName,
        address: vendor.address,
        phone: vendor.phone,
        gstNumber: vendor.gstNumber,
      },
      items: calculatedItems,
      discount,
      total: finalTotal,
      companyId,
      purchaseType: "Purchase Return",
      againstPurchaseId,
      status: "Returned",
      // createdBy: body.createdBy || "system", // This should come from auth
    });

    await purchaseReturn.save();

    // Update stock for each item (subtract from inventory)
    for (const item of calculatedItems) {
      await updateStock(
        item.product,
        item.qty,
        "subtract",
        companyId,
        "return"
      );
    }

    // Update vendor balance (decrease amount owed)
    await updateVendorBalance(vendor._id, finalTotal, "decrease");

    return NextResponse.json(purchaseReturn, { status: 201 });
  } catch (error) {
    console.error("Error creating purchase return:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create purchase return" },
      { status: 500 }
    );
  }
}
