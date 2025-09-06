import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function GET(request) {
  try {
    await connectDB();
    
    // Return empty data for now - you can add actual logic later
    const data = [];
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Simple creation - you can expand this later
    const newItem = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString()
    };
    
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
