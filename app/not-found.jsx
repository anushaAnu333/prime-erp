"use client";

import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Page Not Found
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button
            onClick={() => window.history.back()}
            className="w-full"
          >
            Go Back
          </Button>
          
          <Link href="/dashboard">
            <Button variant="outline" className="w-full">
              Go to Dashboard
            </Button>
          </Link>
        </div>
        
        <div className="text-xs text-gray-500">
          If you believe this is an error, please contact support.
        </div>
      </div>
    </div>
  );
}
