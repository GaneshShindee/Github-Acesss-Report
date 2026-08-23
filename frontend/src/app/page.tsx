"use client";

import React, { useState } from "react";
import { ShieldCheck, Info } from "lucide-react";
import { GithubIcon } from "@/components/ui/GithubIcon";
import { AccessReport } from "@/types/access-report";
import { getAccessReport, ApiError } from "@/lib/api";
import { OrganizationSearch } from "@/components/organization/OrganizationSearch";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

export default function Home() {
  const [searchedOrg, setSearchedOrg] = useState<string>("");
  const [report, setReport] = useState<AccessReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (organization: string) => {
    setSearchedOrg(organization);
    setIsLoading(true);
    setError(null);

    try {
      const data = await getAccessReport(organization);
      setReport(data);
    } catch (err: unknown) {
      setReport(null);
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred while generating the access report.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (searchedOrg) {
      handleSearch(searchedOrg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Visual background ambient gradient blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-indigo-900/20 via-blue-900/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-3xl pointer-events-none -z-10" />

      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-white">
              <GithubIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-base sm:text-lg">
                GitHub Access Report
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Spring Boot Backend Connected</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Search Bar Component */}
        <OrganizationSearch
          onSearch={handleSearch}
          isLoading={isLoading}
          initialValue={searchedOrg}
        />

        {/* Content Section based on state */}
        <div className="max-w-5xl mx-auto">
          {isLoading && <LoadingState organization={searchedOrg} />}

          {!isLoading && error && (
            <ErrorMessage
              message={error}
              onRetry={handleRetry}
            />
          )}

          {!isLoading && !error && report && (
            <Dashboard report={report} />
          )}

          {!isLoading && !error && !report && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 sm:p-14 text-center space-y-3 backdrop-blur-md shadow-xl">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400">
                <Info className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-200">
                Ready to Explore Organization Access
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                Enter a GitHub organization to generate an access report.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>GitHub Access Report Dashboard &copy; 2026</span>
          <span className="flex items-center gap-2">
            <span>Powered by Next.js & Spring Boot</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
