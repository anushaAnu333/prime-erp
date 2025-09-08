import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Transform the return data to match the backend purchase format
    const purchaseReturnData = {
      ...body,
      type: "Purchase Return",
      originalPurchaseId: body.againstPurchaseId, // Map againstPurchaseId to originalPurchaseId
    };
    
    // Remove againstPurchaseId as it's been mapped to originalPurchaseId
    delete purchaseReturnData.againstPurchaseId;
    
    const response = await fetch(`${BACKEND_URL}/api/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      credentials: 'include',
      body: JSON.stringify(purchaseReturnData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying purchase return request:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}




