import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function GET(request) {
  try {
    await connectDB();
    
    // Simple dashboard stats - you can expand this later
    const stats = {
      totalSales: 0,
      totalRevenue: 0,
      totalCustomers: 0,
      totalProducts: 0,
      recentSales: [],
      topProducts: [],
      monthlyRevenue: []
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}



