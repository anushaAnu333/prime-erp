import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Customer from '../../../lib/models/Customer';
import Sale from '../../../lib/models/Sale';
import dashboardCache from '../../../lib/cache/dashboardCache';

// GET /api/customers - Get all customers
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const search = searchParams.get("search") || "";
    const company = searchParams.get("company") || "";
    
    // OPTIMIZED: Check cache first for simple queries
    const cacheKey = `customers_${page}_${limit}_${search}_${company}`;
    const cachedData = dashboardCache.get(cacheKey);
    
    if (cachedData && !search) { // Only cache when no search
      return NextResponse.json(cachedData);
    }

    await connectDB();
    
    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { shopName: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Get total count for pagination
    const total = await Customer.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get customers with pagination
    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const result = {
      customers,
      total,
      totalPages,
      currentPage: parseInt(page),
    };

    // OPTIMIZED: Cache the result for simple queries
    if (!search) {
      dashboardCache.set(cacheKey, result);
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

// POST /api/customers - Create new customer
export async function POST(request) {
  try {
    await connectDB();

    const {
      name,
      address,
      shopName,
      phoneNumber,
      email,
      currentBalance = 0,
    } = await request.json();

    // Validate required fields
    if (!name || !address || !shopName || !phoneNumber) {
      return NextResponse.json(
        {
          message: "Name, address, shop name, and phone number are required",
        },
        { status: 400 }
      );
    }

    // Generate customer code with uniqueness check
    const generateCustomerCode = () => {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      return `CUST${timestamp}${random}`;
    };

    let customerCode = generateCustomerCode();

    // Ensure customer code is unique
    let existingCustomer = await Customer.findOne({ customerCode });
    while (existingCustomer) {
      customerCode = generateCustomerCode();
      existingCustomer = await Customer.findOne({ customerCode });
    }

    // Create new customer
    const customer = new Customer({
      customerCode: customerCode,
      name: name,
      address: address,
      shopName: shopName,
      phoneNumber: phoneNumber,
      email: email || null,
      currentBalance: currentBalance,
    });

    await customer.save();

    return NextResponse.json(
      {
        message: "Customer created successfully",
        customer,
      },
      { status: 201 }
    );
  } catch (error) {
    
    // Return more specific error messages
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { message: "Validation failed", errors },
        { status: 400 }
      );
    }
    
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "Customer code already exists" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Failed to create customer" },
      { status: 500 }
    );
  }
}
