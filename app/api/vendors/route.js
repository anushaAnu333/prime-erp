import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Vendor from '../../../lib/models/Vendor';

// GET /api/vendors - Get all vendors
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await Vendor.countDocuments();

    // Get vendors with pagination
    const vendors = await Vendor.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      vendors,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/vendors - Create new vendor
export async function POST(request) {
  try {
    await connectDB();

    const { vendorName, contactPerson, address, phone, email, gstNumber, paymentTerms } = await request.json();

    // Validate required fields
    if (!vendorName || !contactPerson || !address || !phone || !gstNumber) {
      return NextResponse.json(
        { message: "Vendor name, contact person, address, phone, and GST number are required" },
        { status: 400 }
      );
    }

    // Check if vendor with same name already exists
    const existingVendor = await Vendor.findOne({ 
      vendorName: { $regex: new RegExp(`^${vendorName}$`, 'i') } 
    });
    
    if (existingVendor) {
      return NextResponse.json(
        { message: "Vendor with this name already exists" },
        { status: 400 }
      );
    }

    // Generate unique vendor code
    const generateVendorCode = () => {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      return `VEND${timestamp}${random}`;
    };

    let vendorCode = generateVendorCode();

    // Ensure vendor code is unique
    let existingVendorCode = await Vendor.findOne({ vendorCode });
    while (existingVendorCode) {
      vendorCode = generateVendorCode();
      existingVendorCode = await Vendor.findOne({ vendorCode });
    }

    // Create new vendor
    const vendor = new Vendor({
      vendorCode: vendorCode,
      vendorName: vendorName.trim(),
      contactPerson: contactPerson.trim(),
      address: address.trim(),
      phone: phone.trim(),
      email: email?.trim() || "",
      gstNumber: gstNumber.trim().toUpperCase(),
      paymentTerms: paymentTerms || "30 days",
    });

    await vendor.save();

    return NextResponse.json(
      {
        message: "Vendor created successfully",
        vendor,
      },
      { status: 201 }
    );
  } catch (error) {
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { message: "Validation failed", errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Failed to create vendor" },
      { status: 500 }
    );
  }
}
