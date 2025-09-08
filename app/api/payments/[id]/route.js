import { NextResponse } from "next/server";

// Placeholder routes - implement as needed
export async function GET() {
  return NextResponse.json({ message: "Payment detail route" });
}

export async function PUT() {
  return NextResponse.json({ message: "Update payment route" });
}

export async function DELETE() {
  return NextResponse.json({ message: "Delete payment route" });
}
