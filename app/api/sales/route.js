import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Sale from "@/models/Sale";
import Customer from "@/models/Customer";
import Product from "@/models/Product";
import { getCurrentUser } from "@/lib/auth";
import {
  calculateItemTotals,
  calculateInvoiceTotals,
  generateUniqueInvoiceNumber,
} from "@/lib/calculations";

// GET /api/sales - Get sales with filters
export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const customer = searchParams.get("customer") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";
    const deliveryStatus = searchParams.get("deliveryStatus") || "";
    const company = searchParams.get("company") || "";
    const type = searchParams.get("type") || "Sale";

    // Build query based on user role and company access
    let query = {};

    // Filter by company access
    if (user.companyAccess && user.companyAccess.length > 0) {
      if (user.companyAccess.includes("all")) {
        // Admin/Manager can see all companies
      } else {
        query.companyId = { $in: user.companyAccess };
      }
    }

    // Filter by delivery agent (agents can only see their own invoices)
    if (user.role === "agent") {
      query.deliveryAgent = user.name;
    }

    // Add customer filter
    if (customer) {
      query.customerName = { $regex: customer, $options: "i" };
    }

    // Add company filter
    if (company) {
      query.companyId = company;
    }

    // Add payment status filter
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    // Add delivery status filter
    if (deliveryStatus) {
      query.deliveryStatus = deliveryStatus;
    }

    // Add type filter - only filter if type is "Sale Return"
    // For "Sale" type, we'll include all records (including legacy ones without type field)
    if (type === "Sale Return") {
      query.type = type;
    }

    // Add date filters
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) {
        query.date.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.date.$lte = new Date(dateTo + "T23:59:59.999Z");
      }
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get sales with pagination
    const sales = await Sale.find(query)
      .select(
        "invoiceNo date customerName shopName phoneNumber total deliveryAgent companyId items paymentStatus deliveryStatus type originalSaleId createdAt"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Sale.countDocuments(query);

    // Format response
    const formattedSales = sales.map((sale) => ({
      id: sale._id.toString(),
      _id: sale._id.toString(),
      invoiceNumber: sale.invoiceNo,
      invoiceDate: sale.date,
      customer: {
        name: sale.customerName,
        shopName: sale.shopName,
        phoneNumber: sale.phoneNumber,
      },
      items: sale.items || [],
      finalAmount: sale.total,
      deliveryAgent: sale.deliveryAgent,
      companyId: sale.companyId,
      paymentStatus: sale.paymentStatus || "Pending",
      deliveryStatus: sale.deliveryStatus || "Pending",
      type: sale.type || "Sale",
      originalSaleId: sale.originalSaleId,
    }));

    return NextResponse.json({
      sales: formattedSales,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    });
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/sales - Create new sale/invoice
export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const {
      customerId,
      customerName,
      items,
      discount = 5,
      date = new Date(),
      notes = "",
    } = body;

    // Validate required fields
    if (!customerId || !customerName || !items || items.length === 0) {
      return NextResponse.json(
        { message: "Customer and items are required" },
        { status: 400 }
      );
    }

    // Validate user has company access
    if (!user.companyAccess || user.companyAccess.length === 0) {
      return NextResponse.json(
        {
          message: "User has no company access. Please contact administrator.",
        },
        { status: 400 }
      );
    }

    // Get company ID - handle "all" access case
    let companyId;
    if (user.companyAccess.includes("all")) {
      // For users with "all" access, use a default company
      companyId = "PRIMA-SM";
    } else {
      companyId = user.companyAccess[0];
    }

    if (!companyId) {
      return NextResponse.json(
        { message: "Invalid company access. Please contact administrator." },
        { status: 400 }
      );
    }

    // Verify Sale model is properly imported
    if (!Sale || typeof Sale !== "function") {
      return NextResponse.json(
        { message: "Database model error" },
        { status: 500 }
      );
    }

    // Get customer details
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    // Process items and calculate totals
    const processedItems = [];
    for (const item of items) {
      // Validate product exists
      if (item.productId) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return NextResponse.json(
            { message: `Product not found: ${item.product}` },
            { status: 404 }
          );
        }
      }

      // Get product details to pass to calculateItemTotals
      const product = await Product.findOne({
        name: item.product.toLowerCase(),
      });

      const itemTotals = calculateItemTotals(
        product || item.product, // Pass product object if found, otherwise string
        item.qty,
        item.rate,
        item.expiryDate
      );

      // Add product and customer IDs to the item
      processedItems.push({
        ...itemTotals,
        productId: item.productId,
        customerId: customerId,
        hsnCode: item.hsnCode || itemTotals.hsnCode, // Use form HSN code or calculated HSN code
        unit: item.unit || itemTotals.unit, // Use form unit or calculated unit
      });
    }

    // Calculate invoice totals
    const invoiceTotals = calculateInvoiceTotals(processedItems, discount);

    // Generate unique invoice number using UUID
    const invoiceNo = generateUniqueInvoiceNumber(companyId, new Date(date));

    if (!invoiceNo) {
      return NextResponse.json(
        { message: "Failed to generate invoice number" },
        { status: 500 }
      );
    }

    // Create sale
    const saleData = {
      invoiceNo,
      date: new Date(date),
      customerId: customerId,
      customerName: customer.name,
      customerAddress: customer.address,
      shopName: customer.shopName,
      phoneNumber: customer.phoneNumber,
      items: processedItems,
      discount: invoiceTotals.discount,
      total: invoiceTotals.total,
      notes: notes,
      deliveryAgent: user.name,
      companyId: companyId,
    };

    const sale = new Sale(saleData);
    await sale.save();

    // Update customer balance
    await Customer.updateOne(
      { _id: customer._id },
      { $inc: { currentBalance: invoiceTotals.total } }
    );

    return NextResponse.json({
      message: "Invoice created successfully",
      sale: {
        id: sale._id.toString(),
        invoiceNo: sale.invoiceNo,
        date: sale.date,
        customerName: sale.customerName,
        shopName: sale.shopName,
        total: sale.total,
        deliveryAgent: sale.deliveryAgent,
      },
    });
  } catch (error) {
    console.error("Error creating sale:", error);

    // Provide more specific error messages
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "Invoice number already exists. Please try again." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
