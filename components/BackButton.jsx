"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const BackButton = ({ 
  className = "", 
  text = "Back",
  customPath = null,
  showOnPaths = null // Array of paths where back button should be shown
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Determine if back button should be shown
    const isRootDashboard = pathname === "/dashboard";
    const isLoginOrAuth = pathname.startsWith("/login") || pathname.startsWith("/register");
    
    // Don't show on root dashboard or auth pages
    if (isRootDashboard || isLoginOrAuth) {
      setShouldShow(false);
      return;
    }

    // If specific paths are defined, only show on those paths
    if (showOnPaths) {
      setShouldShow(showOnPaths.some(path => pathname.includes(path)));
      return;
    }

    // Show on all dashboard pages except root
    setShouldShow(pathname.startsWith("/dashboard"));
  }, [pathname, showOnPaths]);

  const handleBack = () => {
    if (customPath) {
      router.push(customPath);
    } else {
      // Smart back navigation
      if (window.history.length > 1) {
        router.back();
      } else {
        // Fallback to dashboard if no history
        router.push("/dashboard");
      }
    }
  };

  if (!shouldShow) {
    return null;
  }

  return (
    <div className={`mb-4 ${className}`}>
      <button
        onClick={handleBack}
        className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200 group"
      >
        <svg
          className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        {text}
      </button>
    </div>
  );
};

export default BackButton;
