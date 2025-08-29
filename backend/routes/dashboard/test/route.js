import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

// Simple test endpoint to verify database connection
export async function GET() {
  try {
    await connectDB();

    return NextResponse.json({
      message: "Dashboard API is working",
      timestamp: new Date().toISOString(),
      status: "connected",
    });
  } catch (error) {
    console.error("Test endpoint error:", error);
    return NextResponse.json(
      {
        message: "Dashboard API test failed",
        error: error.message,
        timestamp: new Date().toISOString(),
        status: "error",
      },
      { status: 500 }
    );
  }
}
