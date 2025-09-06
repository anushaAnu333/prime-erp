import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Vendor from "@/lib/models/Vendor";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    // Build query
    let query = { isActive: true };

    if (search) {
      query.$or = [
        { vendorName: { $regex: search, $options: "i" } },
        { contactPerson: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { vendorCode: { $regex: search, $options: "i" } },
      ];
    }

    // Get vendors with filtering
    const vendors = await Vendor.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ vendors });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return NextResponse.json(
      { message: "Failed to fetch vendors" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "vendorName",
      "contactPerson",
      "address",
      "phone",
      "gstNumber",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Generate vendor code
    const generateVendorCode = () => {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      return `VEND${timestamp}${random}`;
    };

    let vendorCode = generateVendorCode();

    // Ensure vendor code is unique
    let existingVendor = await Vendor.findOne({ vendorCode });
    while (existingVendor) {
      vendorCode = generateVendorCode();
      existingVendor = await Vendor.findOne({ vendorCode });
    }

    // Create new vendor
    const vendor = new Vendor({
      vendorCode: vendorCode,
      vendorName: body.vendorName,
      contactPerson: body.contactPerson,
      address: body.address,
      phone: body.phone,
      email: body.email || "",
      gstNumber: body.gstNumber,
      paymentTerms: body.paymentTerms || "30 days",
      currentBalance: body.currentBalance || 0,
    });

    await vendor.save();

    return NextResponse.json(
      { message: "Vendor created successfully", vendor },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating vendor:", error);
    return NextResponse.json(
      { message: "Failed to create vendor" },
      { status: 500 }
    );
  }
}
