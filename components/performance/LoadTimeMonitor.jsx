"use client";

import { useEffect, useState } from 'react';

const LoadTimeMonitor = () => {
  const [loadTime, setLoadTime] = useState(null);
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const startTime = performance.now();
      
      const handleLoad = () => {
        const endTime = performance.now();
        const totalTime = Math.round(endTime - startTime);
        setLoadTime(totalTime);
        setIsSlow(totalTime > 2000); // Consider slow if > 2 seconds
        
        // Log performance metrics
        console.log(`🚀 Page Load Time: ${totalTime}ms`);
        
        if (totalTime > 2000) {
          console.warn(`⚠️ Slow page load detected: ${totalTime}ms`);
        } else {
          console.log(`✅ Good page load time: ${totalTime}ms`);
        }
      };

      if (document.readyState === 'complete') {
        handleLoad();
      } else {
        window.addEventListener('load', handleLoad);
      }

      return () => {
        window.removeEventListener('load', handleLoad);
      };
    }
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development' || !loadTime) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 px-3 py-2 rounded-lg text-sm font-medium ${
      isSlow ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-green-100 text-green-800 border border-green-200'
    }`}>
      {isSlow ? '⚠️' : '✅'} Load: {loadTime}ms
    </div>
  );
};

export default LoadTimeMonitor;

