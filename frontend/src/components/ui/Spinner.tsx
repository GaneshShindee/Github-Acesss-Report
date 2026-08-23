import React from "react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export function Spinner({ size = "md", className = "", label }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-3",
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`} role="status">
      <div
        className={`${sizeClasses[size]} rounded-full border-t-cyan-400 border-r-cyan-400/30 border-b-cyan-400/10 border-l-cyan-400/30 animate-spin`}
      />
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
}
