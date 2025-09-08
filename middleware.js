import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define protected routes that require authentication
const protectedRoutes = [
  '/api/auth/me',
  '/api/customers',
  '/api/sales',
  '/api/products',
  '/api/purchases',
  '/api/vendors',
  '/api/stock',
  '/api/payments',
  '/api/users',
  '/api/companies',
  '/api/dashboard',
  '/api/reports'
];

// Define protected page routes
const protectedPages = [
  '/dashboard',
  '/reports'
];

// Define public routes that don't require authentication
const publicRoutes = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/health'
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  const isProtectedPage = protectedPages.some(route => 
    pathname.startsWith(route)
  );
  
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  );

  // If it's a protected API route, check for authentication using NextAuth
  if (isProtectedRoute) {
    try {
      const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development' 
      });
      
      if (!token) {
        return NextResponse.json(
          { message: 'Authentication required' },
          { status: 401 }
        );
      }
      
      // Token exists, let the API route handle the actual verification
      return NextResponse.next();
    } catch (error) {
      console.error('Token validation failed:', error);
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }
  }

  // If it's a protected page, redirect to login if not authenticated
  if (isProtectedPage) {
    try {
      const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development' 
      });
      
      if (!token) {
        // Redirect to login page
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
      
      // User is authenticated, allow access
      return NextResponse.next();
    } catch (error) {
      console.error('Page authentication failed:', error);
      // Redirect to login page on error
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Add CORS headers for all API routes
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    
    // Set CORS headers
    response.headers.set('Access-Control-Allow-Origin', 
      process.env.NODE_ENV === 'production' 
        ? process.env.CORS_ORIGIN || 'https://your-domain.vercel.app'
        : 'http://localhost:3000'
    );
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: response.headers });
    }
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
