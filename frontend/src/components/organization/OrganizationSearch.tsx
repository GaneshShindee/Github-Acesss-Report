"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GithubIcon } from "@/components/ui/GithubIcon";

interface OrganizationSearchProps {
  onSearch: (organization: string) => void;
  isLoading: boolean;
  initialValue?: string;
}

export function OrganizationSearch({
  onSearch,
  isLoading,
  initialValue = "",
}: OrganizationSearchProps) {
  const [inputVal, setInputVal] = useState(initialValue);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim();

    if (!trimmed) {
      setValidationError("Please enter a valid GitHub organization name.");
      return;
    }

    setValidationError(null);
    onSearch(trimmed);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
    if (validationError) {
      setValidationError(null);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Header section with GitHub-inspired badge & gradient title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-medium backdrop-blur-sm">
          <GithubIcon className="w-4 h-4 text-white" />
          <span>GitHub Access Report</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Organization Access Report
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Understand who has access to your organization&apos;s repositories and inspect granular user permissions.
        </p>
      </div>

      {/* Search Form Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
            <div className="flex-1">
              <Input
                label="GitHub Organization"
                placeholder="e.g. github, vercel, facebook"
                value={inputVal}
                onChange={handleInputChange}
                error={validationError || undefined}
                disabled={isLoading}
                leftIcon={<GithubIcon className="w-4 h-4" />}
                autoComplete="off"
                aria-describedby={validationError ? "org-search-error" : undefined}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              disabled={isLoading}
              leftIcon={<Search className="w-4 h-4" />}
              className="sm:self-end py-2.5 h-[42px] whitespace-nowrap"
            >
              Generate Report
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
