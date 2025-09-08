import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Product from '../../../lib/models/Product';

// GET /api/products - Get all products
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search') || '';
    
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
      .lean();

    return NextResponse.json({
      products,
      total,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product
export async function POST(request) {
  try {
    await connectDB();

    const { name, hsnCode, gstRate } = await request.json();

    // Validate required fields
    if (!name || !hsnCode || gstRate === undefined || gstRate === null) {
      return NextResponse.json(
        { message: "Name, HSN Code, and GST Rate are required" },
        { status: 400 }
      );
    }

    // Check if product with same name already exists
    const existingProduct = await Product.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existingProduct) {
      return NextResponse.json(
        { message: "Product with this name already exists" },
        { status: 400 }
      );
    }

    // Generate unique product code
    const generateProductCode = () => {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      return `PROD${timestamp}${random}`;
    };

    let productCode = generateProductCode();

    // Ensure product code is unique
    let existingProductCode = await Product.findOne({ productCode });
    while (existingProductCode) {
      productCode = generateProductCode();
      existingProductCode = await Product.findOne({ productCode });
    }

    // Create new product
    const product = new Product({
      productCode: productCode,
      name: name.trim(),
      hsnCode: hsnCode.trim(),
      gstRate: Number(gstRate),
    });

    await product.save();

    return NextResponse.json(
      {
        message: "Product created successfully",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { message: "Validation failed", errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Failed to create product" },
      { status: 500 }
    );
  }
}
