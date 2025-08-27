import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Purchase from "../../../models/Purchase";
import Vendor from "../../../models/Vendor";
import {
  calculatePurchaseTotals,
  generatePurchaseNumber,
} from "../../../lib/calculations";
import { updateStock, updateVendorBalance } from "../../../lib/stockManager";

// GET /api/purchases - List purchases
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const vendor = searchParams.get("vendor");
    const company = searchParams.get("company");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const type = searchParams.get("type") || "Purchase";

    let filter = { purchaseType: type };

    if (company) {
      filter.companyId = company;
    }

    if (vendor) {
      filter.vendorName = new RegExp(vendor, "i");
    }

    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) {
        filter.date.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.date.$lte = new Date(dateTo);
      }
    }

    const skip = (page - 1) * limit;

    const purchases = await Purchase.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    // Add hasReturns field to each purchase and populate againstPurchaseId for returns
    const purchasesWithReturns = await Promise.all(
      purchases.map(async (purchase) => {
        const purchaseObj = purchase.toObject();

        if (
          purchase.purchaseType === "Purchase Return" &&
          purchase.againstPurchaseId
        ) {
          // For returns, populate the original purchase details
          const originalPurchase = await Purchase.findById(
            purchase.againstPurchaseId
          );
          if (originalPurchase) {
            purchaseObj.originalPurchase = {
              purchaseNumber: originalPurchase.purchaseNumber,
              date: originalPurchase.date,
              vendorName: originalPurchase.vendorName,
            };
          }
        } else if (purchase.purchaseType === "Purchase") {
          // Check if this purchase has any returns
          const returns = await Purchase.find({
            againstPurchaseId: purchase._id,
            purchaseType: "Purchase Return",
          });

          purchaseObj.hasReturns = returns.length > 0;
        }

        return purchaseObj;
      })
    );

    const total = await Purchase.countDocuments(filter);

    return NextResponse.json({
      purchases: purchasesWithReturns,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}

// POST /api/purchases - Create purchase invoice
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      vendorName,
      companyId,
      supplierInvoiceNumber,
      supplierInvoiceDate,
      items,
      discount = 0,
      purchaseType = "Purchase",
      againstPurchaseId = null,
    } = body;

    // Validate purchase data
    const validation = validatePurchaseData({
      vendorName,
      companyId,
      supplierInvoiceNumber,
      supplierInvoiceDate,
      items,
      discount,
    });

    if (!validation.isValid) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
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

    // Calculate total invoice value
    const totalInvoiceValue = calculatedItems.reduce(
      (sum, item) => sum + item.invoiceValue,
      0
    );
    const finalTotal = totalInvoiceValue - discount;

    // Generate purchase number
    const purchaseNumber = await generatePurchaseNumber(companyId);

    // Create purchase record
    const purchase = new Purchase({
      purchaseNumber,
      date: new Date(),
      vendorName: vendor.vendorName,
      vendorDetails: {
        name: vendor.vendorName,
        address: vendor.address,
        phone: vendor.phone,
        gstNumber: vendor.gstNumber,
      },
      supplierInvoiceNumber: supplierInvoiceNumber || null,
      supplierInvoiceDate: supplierInvoiceDate
        ? new Date(supplierInvoiceDate)
        : null,
      items: calculatedItems,
      discount,
      total: finalTotal,
      companyId,
      purchaseType,
      againstPurchaseId,
      status: purchaseType === "Purchase" ? "Pending" : "Returned",
      // createdBy: body.createdBy || 'system' // This should come from auth
    });

    await purchase.save();

    // Update stock for each item
    for (const item of calculatedItems) {
      const operation = purchaseType === "Purchase" ? "add" : "subtract";
      await updateStock(
        item.product,
        item.qty,
        operation,
        companyId,
        purchaseType === "Purchase" ? "purchase" : "return"
      );
    }

    // Update vendor balance
    const balanceOperation =
      purchaseType === "Purchase" ? "increase" : "decrease";
    await updateVendorBalance(vendor._id, finalTotal, balanceOperation);

    return NextResponse.json(purchase, { status: 201 });
  } catch (error) {
    console.error("Error creating purchase:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create purchase" },
      { status: 500 }
    );
  }
}
