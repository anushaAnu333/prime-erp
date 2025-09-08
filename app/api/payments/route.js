import { NextResponse } from "next/server";

// Placeholder routes - implement as needed
export async function GET() {
  return NextResponse.json({ message: "Payments route" });
}

export async function POST() {
  return NextResponse.json({ message: "Create payment route" });
}
