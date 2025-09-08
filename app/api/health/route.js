import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';

export async function GET() {
  try {
    // Test database connection
    await connectDB();
    
    return NextResponse.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      database: "Connected"
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "ERROR",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        database: "Disconnected",
        error: error.message
      },
      { status: 503 }
    );
  }
}
