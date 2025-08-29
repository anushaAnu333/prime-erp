import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Company from "../../../models/Company";

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
