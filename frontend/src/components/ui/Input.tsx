import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center rounded-lg shadow-sm">
          {leftIcon && (
            <div className="absolute left-3.5 pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-slate-900/90 border text-slate-100 text-sm rounded-lg focus:outline-none focus:ring-2 transition-all placeholder:text-slate-500 py-2.5 ${
              leftIcon ? "pl-10" : "pl-3.5"
            } ${rightIcon ? "pr-10" : "pr-3.5"} ${
              error
                ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30"
                : "border-slate-700/80 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-slate-600"
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-rose-400 flex items-center gap-1 mt-1">
            <span>{error}</span>
          </p>
        )}
        {helperText && !error && (
          <p className="text-xs text-slate-400 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
