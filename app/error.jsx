'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-6xl font-bold text-red-300">⚠️</h1>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Something went wrong!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We're sorry, but something unexpected happened. Please try again.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button
            onClick={reset}
            className="w-full"
          >
            Try Again
          </Button>
          
          <Button
            onClick={() => window.location.href = '/dashboard'}
            variant="outline"
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </div>
        
        <div className="text-xs text-gray-500">
          Error ID: {error?.message || 'Unknown error'}
        </div>
      </div>
    </div>
  );
}
