import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Sale from "@/lib/models/Sale";

export async function GET(request) {
  try {
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

    // Build query
    let query = {};

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

    // Add type filter
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

    const response = NextResponse.json({
      sales: formattedSales,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    });

    // Add caching headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return response;
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate required fields
    const requiredFields = ["customerId", "customerName", "items"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Generate invoice number
    const generateInvoiceNumber = () => {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      return `INV${timestamp}${random}`;
    };

    const invoiceNo = generateInvoiceNumber();

    // Create sale
    const sale = new Sale({
      invoiceNo,
      date: new Date(body.date || Date.now()),
      customerId: body.customerId,
      customerName: body.customerName,
      customerAddress: body.customerAddress || "",
      shopName: body.shopName || "",
      phoneNumber: body.phoneNumber || "",
      items: body.items,
      discount: body.discount || 0,
      total: body.total || 0,
      notes: body.notes || "",
      deliveryAgent: body.deliveryAgent || "System",
      companyId: body.companyId || "PRIMA-SM",
      paymentStatus: body.paymentStatus || "Pending",
      deliveryStatus: body.deliveryStatus || "Pending",
      type: body.type || "Sale",
    });

    await sale.save();

    return NextResponse.json({
      message: "Sale created successfully",
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
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
