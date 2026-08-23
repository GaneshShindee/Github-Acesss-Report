"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Info, Key, LogOut, CheckCircle2, Lock, X } from "lucide-react";
import { GithubIcon } from "@/components/ui/GithubIcon";
import { Button } from "@/components/ui/Button";
import { AccessReport } from "@/types/access-report";
import { getAccessReport, getOAuthLoginUrl, ApiError } from "@/lib/api";
import { OrganizationSearch } from "@/components/organization/OrganizationSearch";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

export default function Home() {
  const [searchedOrg, setSearchedOrg] = useState<string>("");
  const [report, setReport] = useState<AccessReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Authentication State
  const [authToken, setAuthToken] = useState<string>("");
  const [showTokenInput, setShowTokenInput] = useState<boolean>(false);
  const [tempToken, setTempToken] = useState<string>("");
  const [oauthSuccessToast, setOauthSuccessToast] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check URL query params for OAuth token redirect (?token=gho_...)
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get("token");

      if (tokenFromUrl && tokenFromUrl.trim()) {
        const cleanToken = tokenFromUrl.trim();
        setAuthToken(cleanToken);
        setTempToken(cleanToken);
        localStorage.setItem("github_access_token", cleanToken);
        setOauthSuccessToast(true);

        // Clean up URL query parameters in address bar
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
    }

    // 2. Load stored token from localStorage if present
    const storedToken = localStorage.getItem("github_access_token");
    if (storedToken) {
      setAuthToken(storedToken);
      setTempToken(storedToken);
    }
  }, []);

  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tempToken.trim();
    setAuthToken(trimmed);
    if (trimmed) {
      localStorage.setItem("github_access_token", trimmed);
    } else {
      localStorage.removeItem("github_access_token");
    }
    setShowTokenInput(false);
  };

  const handleClearToken = () => {
    setAuthToken("");
    setTempToken("");
    localStorage.removeItem("github_access_token");
  };

  const handleOAuthLogin = () => {
    window.location.href = getOAuthLoginUrl();
  };

  const handleSearch = async (organization: string) => {
    setSearchedOrg(organization);
    setIsLoading(true);
    setError(null);

    try {
      const data = await getAccessReport(organization, authToken);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
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

          {/* Authentication Actions */}
          <div className="flex items-center gap-3">
            <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Backend Connected</span>
            </span>

            {/* OAuth Login Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleOAuthLogin}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs py-1.5 h-9"
              leftIcon={<GithubIcon className="w-4 h-4 text-white" />}
            >
              <span className="hidden sm:inline">Sign in with GitHub</span>
              <span className="sm:hidden">OAuth</span>
            </Button>

            {/* Custom Token Toggle */}
            {authToken ? (
              <div className="flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-lg text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Token Active</span>
                <button
                  onClick={handleClearToken}
                  title="Clear token"
                  className="hover:text-emerald-200 transition-colors ml-1"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTokenInput(!showTokenInput)}
                className="text-xs h-9 border border-slate-800 hover:border-slate-700 text-slate-300"
                leftIcon={<Key className="w-3.5 h-3.5 text-indigo-400" />}
              >
                PAT Token
              </Button>
            )}
          </div>
        </div>

        {/* Custom PAT Token Input Panel */}
        {showTokenInput && (
          <div className="border-t border-slate-800 bg-slate-900/90 backdrop-blur-xl px-4 py-3">
            <form onSubmit={handleSaveToken} className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 relative w-full">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Paste GitHub Personal Access Token (PAT) or OAuth token..."
                  value={tempToken}
                  onChange={(e) => setTempToken(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button type="submit" size="sm" variant="primary" className="text-xs h-8">
                  Save Token
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowTokenInput(false)}
                  className="text-xs h-8 text-slate-400"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </header>

      {/* OAuth Success Banner Toast */}
      {oauthSuccessToast && (
        <div className="bg-emerald-900/80 border-b border-emerald-500/30 text-emerald-200 px-4 py-2.5 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Successfully authenticated with GitHub OAuth! Your access token is active.</span>
          </div>
          <button onClick={() => setOauthSuccessToast(false)} className="text-emerald-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
                Enter a GitHub organization to generate an access report. You can also sign in with GitHub OAuth or provide a custom token in the header.
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
