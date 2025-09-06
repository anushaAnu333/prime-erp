import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Company from "@/lib/models/Company";

export async function GET() {
  try {
    await connectDB();
    const companies = await Company.find({ isActive: true }).sort({
      companyCode: 1,
    });
    return NextResponse.json({ companies });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { message: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate required fields
    const requiredFields = ["companyCode", "name", "address", "gstNumber"];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Create new company
    const company = new Company({
      companyCode: body.companyCode,
      name: body.name,
      address: body.address,
      gstNumber: body.gstNumber,
    });

    await company.save();

    return NextResponse.json(
      { message: "Company created successfully", company },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating company:", error);
    return NextResponse.json(
      { message: "Failed to create company" },
      { status: 500 }
    );
  }
}
