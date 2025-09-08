"use client";

import { useEffect, useState } from 'react';

const PerformanceMonitor = ({ children }) => {
  const [performanceMetrics, setPerformanceMetrics] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Monitor Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
          }
          if (entry.entryType === 'first-input') {
            console.log('FID:', entry.processingStart - entry.startTime);
          }
          if (entry.entryType === 'layout-shift') {
            if (!entry.hadRecentInput) {
              console.log('CLS:', entry.value);
            }
          }
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

      // Monitor page load time
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        
        setPerformanceMetrics({
          loadTime: Math.round(loadTime),
          domContentLoaded: Math.round(domContentLoaded),
          totalTime: Math.round(navigation.loadEventEnd - navigation.fetchStart)
        });

        console.log('Page Load Performance:', {
          loadTime: Math.round(loadTime),
          domContentLoaded: Math.round(domContentLoaded),
          totalTime: Math.round(navigation.loadEventEnd - navigation.fetchStart)
        });
      });

      return () => {
        observer.disconnect();
      };
    }
  }, []);

  // Show performance warning in development
  if (process.env.NODE_ENV === 'development' && performanceMetrics) {
    const isSlow = performanceMetrics.totalTime > 3000;
    
    if (isSlow) {
      console.warn('⚠️ Slow page load detected:', performanceMetrics);
    }
  }

  return children;
};

export default PerformanceMonitor;

