import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export function Card({ children, className = "", hoverEffect = false, ...props }: CardProps) {
  return (
    <div
      className={`bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg shadow-black/20 ${
        hoverEffect ? "transition-all duration-200 hover:border-slate-700 hover:shadow-indigo-950/20" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
