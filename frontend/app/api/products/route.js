import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/lib/models/Product";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { productCode: { $regex: search, $options: "i" } },
        { hsnCode: { $regex: search, $options: "i" } },
      ];
    }

    // Get total count for pagination
    const total = await Product.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get products with pagination
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for better performance

    const response = NextResponse.json({
      products,
      total,
      totalPages,
      currentPage: page,
    });

    // Add caching headers
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=10, stale-while-revalidate=59"
    );
    response.headers.set("X-Response-Time", `${Date.now() - Date.now()}ms`);

    return response;
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate required fields
    const requiredFields = ["name", "hsnCode", "gstRate"];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Generate product code
    const generateProductCode = () => {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      return `PROD${timestamp}${random}`;
    };

    let productCode = generateProductCode();

    // Ensure product code is unique
    let existingProduct = await Product.findOne({ productCode });
    while (existingProduct) {
      productCode = generateProductCode();
      existingProduct = await Product.findOne({ productCode });
    }

    // Create new product
    const product = new Product({
      productCode: productCode,
      name: body.name,
      hsnCode: body.hsnCode,
      gstRate: body.gstRate,
    });

    await product.save();

    return NextResponse.json(
      { message: "Product created successfully", product },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { message: "Failed to create product" },
      { status: 500 }
    );
  }
}
