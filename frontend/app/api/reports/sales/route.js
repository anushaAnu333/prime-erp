import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    const response = await fetch(`${BACKEND_URL}/api/reports/sales?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    // Handle different content types for downloads
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('text/csv')) {
      const csvData = await response.text();
      return new NextResponse(csvData, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': response.headers.get('content-disposition') || 'attachment; filename="sales-report.csv"',
        },
      });
    }
    
    if (contentType?.includes('text/html')) {
      const htmlData = await response.text();
      return new NextResponse(htmlData, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': response.headers.get('content-disposition') || 'attachment; filename="sales-report.html"',
        },
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying sales report request:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}



