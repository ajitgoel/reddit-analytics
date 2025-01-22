import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"; // Define the possible values for size
}

export function LoadingSpinner({ size = "md" }: LoadingSpinnerProps) {
  // Define size classes based on the size prop
  const sizeClasses = {
    sm: "h-4 w-4 border-2", // Small size
    md: "h-6 w-6 border-2", // Medium size (default)
    lg: "h-8 w-8 border-4", // Large size
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full border-primary border-t-transparent ${sizeClasses[size]}`}
      />
    </div>
  );
}