import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Vendor from '../../../../lib/models/Vendor';

// GET /api/vendors/[id] - Get single vendor
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return NextResponse.json(
        { message: "Vendor not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ vendor });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/vendors/[id] - Update vendor
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const vendor = await Vendor.findByIdAndUpdate(id, await request.json(), {
      new: true,
    });
    if (!vendor) {
      return NextResponse.json(
        { message: "Vendor not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ vendor });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/vendors/[id] - Delete vendor
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const vendor = await Vendor.findByIdAndDelete(id);
    if (!vendor) {
      return NextResponse.json(
        { message: "Vendor not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Vendor deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}