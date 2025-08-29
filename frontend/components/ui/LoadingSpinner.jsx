import React from "react";

const LoadingSpinner = ({
  size = "md",
  color = "blue",
  text = "Loading...",
  showText = true,
  className = "",
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const colorClasses = {
    blue: "border-blue-600",
    green: "border-green-600",
    red: "border-red-600",
    gray: "border-gray-600",
    white: "border-white",
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]}`}
        role="status"
        aria-label="Loading"
      />
      {showText && text && <p className="mt-2 text-sm text-gray-600">{text}</p>}
    </div>
  );
};

// Optimized skeleton loader for content
export const SkeletonLoader = ({
  lines = 3,
  className = "",
  height = "h-4",
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-gray-200 rounded ${height}`}
        />
      ))}
    </div>
  );
};

// Optimized page loader
export const PageLoader = ({ message = "Loading page..." }) => {
  return (
    <div className="flex items-center justify-center min-h-64">
      <LoadingSpinner size="lg" text={message} />
    </div>
  );
};

// Optimized table loader
export const TableLoader = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-3">
      {/* Header skeleton */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse bg-gray-200 rounded h-4 flex-1"
          />
        ))}
      </div>

      {/* Row skeletons */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="animate-pulse bg-gray-100 rounded h-6 flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default LoadingSpinner;
