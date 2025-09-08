import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Customer from '../../../../lib/models/Customer';
import Sale from '../../../../lib/models/Sale';

// GET /api/customers/[id] - Get customer by ID
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const customer = await Customer.findById(id);

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ customer });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

// PUT /api/customers/[id] - Update customer
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const { name, address, shopName, phoneNumber, companyId, currentBalance } =
      await request.json();

    const customer = await Customer.findByIdAndUpdate(
      id,
      { name, address, shopName, phoneNumber, companyId, currentBalance },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update customer" },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/[id] - Delete customer
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const customer = await Customer.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Customer deleted successfully",
      customer,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete customer" },
      { status: 500 }
    );
  }
}