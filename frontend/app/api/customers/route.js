import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Customer from "@/lib/models/Customer";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const search = searchParams.get("search") || "";
    const company = searchParams.get("company") || "";

    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { shopName: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    if (company) {
      query.companyId = company;
    }

    // Get total count for pagination
    const total = await Customer.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get customers with pagination
    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const response = NextResponse.json({
      customers,
      total,
      totalPages,
      currentPage: page,
    });

    // Add caching headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');
    
    return response;
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { message: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate required fields
    const requiredFields = ["name", "address", "shopName", "phoneNumber"];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Generate customer code
    const lastCustomer = await Customer.findOne().sort({ customerCode: -1 });
    let nextNumber = 1;

    if (lastCustomer && lastCustomer.customerCode) {
      const lastNumber = parseInt(
        lastCustomer.customerCode.replace("CUST", "")
      );
      nextNumber = lastNumber + 1;
    }

    const customerCode = `CUST${nextNumber.toString().padStart(3, "0")}`;

    // Handle empty companyId - convert to null
    const companyId =
      body.companyId && body.companyId.trim() !== "" ? body.companyId : null;

    console.log("Creating customer with companyId:", companyId);

    // Create new customer
    const customer = new Customer({
      customerCode: customerCode,
      name: body.name,
      address: body.address,
      shopName: body.shopName,
      phoneNumber: body.phoneNumber,
      companyId: companyId,
      currentBalance: body.currentBalance || 0,
    });

    await customer.save();

    return NextResponse.json(
      { message: "Customer created successfully", customer },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { message: "Failed to create customer" },
      { status: 500 }
    );
  }
}
