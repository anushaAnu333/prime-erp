import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Purchase from "@/lib/models/Purchase";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const vendor = searchParams.get("vendor");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const type = searchParams.get("type") || "Purchase";

    let filter = { purchaseType: type };

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

    const total = await Purchase.countDocuments(filter);

    return NextResponse.json({
      purchases,
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

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate required fields
    const requiredFields = ["vendorName", "items"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Generate purchase number
    const generatePurchaseNumber = () => {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      return `PUR${timestamp}${random}`;
    };

    const purchaseNumber = generatePurchaseNumber();

    // Calculate total
    const total = body.items.reduce((sum, item) => {
      return sum + (item.qty * item.rate);
    }, 0);

    // Create purchase
    const purchase = new Purchase({
      purchaseNumber,
      date: new Date(body.date || Date.now()),
      vendorName: body.vendorName,
      vendorDetails: {
        name: body.vendorName,
        address: body.vendorAddress || "",
        phone: body.vendorPhone || "",
        gstNumber: body.vendorGst || "",
      },
      supplierInvoiceNumber: body.supplierInvoiceNumber || null,
      supplierInvoiceDate: body.supplierInvoiceDate ? new Date(body.supplierInvoiceDate) : null,
      items: body.items,
      discount: body.discount || 0,
      total: total - (body.discount || 0),
      purchaseType: body.purchaseType || "Purchase",
      againstPurchaseId: body.againstPurchaseId || null,
      status: body.purchaseType === "Purchase Return" ? "Returned" : "Pending",
    });

    await purchase.save();

    return NextResponse.json(purchase, { status: 201 });
  } catch (error) {
    console.error("Error creating purchase:", error);
    return NextResponse.json(
      { error: "Failed to create purchase" },
      { status: 500 }
    );
  }
}
