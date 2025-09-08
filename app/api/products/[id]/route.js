import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Product from '../../../../lib/models/Product';

// GET /api/products/[id] - Get product by ID
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update product
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const { name, hsnCode, gstRate } = await request.json();

    // Check if another product with same name exists (excluding current product)
    const existingProduct = await Product.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: id }
    });
    
    if (existingProduct) {
      return NextResponse.json(
        { message: "Another product with this name already exists" },
        { status: 400 }
      );
    }

    // Update product (productCode should not be changed)
    const product = await Product.findByIdAndUpdate(
      id,
      { 
        name: name.trim(), 
        hsnCode: hsnCode.trim(), 
        gstRate: Number(gstRate) 
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { message: "Validation failed", errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Product deleted successfully",
      product,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete product" },
      { status: 500 }
    );
  }
}