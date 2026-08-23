import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({
  title = "Error Generating Report",
  message,
  onRetry,
  className = "",
}: ErrorMessageProps) {
  return (
    <div
      className={`bg-rose-950/40 border border-rose-800/60 rounded-xl p-5 text-rose-200 backdrop-blur-sm shadow-xl ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3.5">
        <div className="p-2 bg-rose-900/60 rounded-lg shrink-0 border border-rose-700/50">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-rose-100">{title}</h4>
          <p className="text-sm text-rose-300/90 mt-1 leading-relaxed break-words">{message}</p>

          {onRetry && (
            <div className="mt-3.5">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                className="border-rose-700/60 hover:bg-rose-900/40 text-rose-200"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
