import React from "react";
import { Spinner } from "./Spinner";

interface LoadingStateProps {
  organization?: string;
}

export function LoadingState({ organization }: LoadingStateProps) {
  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl space-y-5 animate-in fade-in duration-200">
      <div className="flex justify-center">
        <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-inner">
          <Spinner size="lg" aria-label="Loading access report..." />
        </div>
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <h3 className="text-lg font-bold text-white tracking-tight">
          Generating access report{organization ? ` for '${organization}'` : ""}...
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          Fetching repositories and repository access information from GitHub backend service.
          This may take a moment for large organizations.
        </p>
      </div>

      {/* Subtle pulsing progress indicator bar */}
      <div className="w-full max-w-xs mx-auto h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="w-full h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 animate-pulse rounded-full" />
      </div>
    </div>
  );
}
