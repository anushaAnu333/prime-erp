import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Vendor from "@/models/Vendor";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const vendor = await Vendor.findById(params.id);

    if (!vendor) {
      return NextResponse.json(
        { message: "Vendor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ vendor });
  } catch (error) {
    console.error("Error fetching vendor:", error);
    return NextResponse.json(
      { message: "Failed to fetch vendor" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
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

    // Update vendor
    const vendor = await Vendor.findByIdAndUpdate(
      params.id,
      {
        vendorName: body.vendorName,
        contactPerson: body.contactPerson,
        address: body.address,
        phone: body.phone,
        email: body.email || "",
        gstNumber: body.gstNumber,
        paymentTerms: body.paymentTerms || "30 days",
        companyId: body.companyId || "PRIMA-SM",
      },
      { new: true }
    );

    if (!vendor) {
      return NextResponse.json(
        { message: "Vendor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ vendor });
  } catch (error) {
    console.error("Error updating vendor:", error);
    return NextResponse.json(
      { message: "Failed to update vendor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const vendor = await Vendor.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    );

    if (!vendor) {
      return NextResponse.json(
        { message: "Vendor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Vendor deleted successfully" });
  } catch (error) {
    console.error("Error deleting vendor:", error);
    return NextResponse.json(
      { message: "Failed to delete vendor" },
      { status: 500 }
    );
  }
}
