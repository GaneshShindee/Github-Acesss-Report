"use client";

import React, { useState, useMemo } from "react";
import { Search, Users, ChevronDown, ChevronUp, Download, FileSpreadsheet, FileCode } from "lucide-react";
import { UserAccess } from "@/types/access-report";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { UserAccessRow } from "./UserAccessRow";

interface UserAccessTableProps {
  users: UserAccess[];
  organization: string;
}

export function UserAccessTable({ users, organization }: UserAccessTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedUsernames, setExpandedUsernames] = useState<Set<string>>(new Set());
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Filter & Sort users alphabetically by username
  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let result = users || [];

    if (query) {
      result = result.filter((u) =>
        (u.username || "").toLowerCase().includes(query)
      );
    }

    return [...result].sort((a, b) =>
      (a.username || "").localeCompare(b.username || "", undefined, {
        sensitivity: "base",
      })
    );
  }, [users, searchQuery]);

  const toggleExpand = (username: string) => {
    setExpandedUsernames((prev) => {
      const next = new Set(prev);
      if (next.has(username)) {
        next.delete(username);
      } else {
        next.add(username);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    if (expandedUsernames.size === filteredUsers.length) {
      setExpandedUsernames(new Set());
    } else {
      setExpandedUsernames(new Set(filteredUsers.map((u) => u.username)));
    }
  };

  const exportToCSV = () => {
    if (!users || users.length === 0) return;

    const rows: string[][] = [["Username", "Repository Name", "Full Repository Name", "Permission"]];

    users.forEach((user) => {
      (user.repositories || []).forEach((repo) => {
        rows.push([
          `"${user.username}"`,
          `"${repo.repositoryName}"`,
          `"${repo.repositoryFullName}"`,
          `"${repo.permission}"`,
        ]);
      });
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${organization}-access-report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const exportToJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(
        JSON.stringify(
          { organization, generatedAt: new Date().toISOString(), totalUsers: users.length, users },
          null,
          2
        )
      );
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `${organization}-access-report.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const allExpanded =
    filteredUsers.length > 0 && expandedUsernames.size === filteredUsers.length;

  return (
    <div className="space-y-4">
      {/* Section Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>User Access</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Search and explore repository permissions across organization users.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              aria-label="Search users by username"
            />
          </div>

          {/* Export Dropdown */}
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="text-xs h-[38px] px-3 flex items-center gap-1.5 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200"
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </Button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 py-1.5 backdrop-blur-xl">
                <button
                  onClick={exportToCSV}
                  className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export as CSV</span>
                </button>
                <button
                  onClick={exportToJSON}
                  className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Export as JSON</span>
                </button>
              </div>
            )}
          </div>

          {filteredUsers.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExpandAll}
              className="text-xs shrink-0 h-[38px] border border-slate-800 hover:border-slate-700"
              rightIcon={
                allExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )
              }
            >
              {allExpanded ? "Collapse All" : "Expand All"}
            </Button>
          )}
        </div>
      </div>

      {/* Result Stats Counter */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong className="text-slate-200">{filteredUsers.length}</strong> of{" "}
          <strong className="text-slate-200">{users.length}</strong> users
        </span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl">
        {/* Table Header */}
        <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span className="flex-1">User</span>
          <span className="hidden sm:block text-center w-36">Repositories</span>
          <span className="w-16 text-right">Action</span>
        </div>

        {/* Table Rows or Empty State */}
        {filteredUsers.length > 0 ? (
          <div className="divide-y divide-slate-800/80">
            {filteredUsers.map((user) => (
              <UserAccessRow
                key={user.username}
                user={user}
                organization={organization}
                isExpanded={expandedUsernames.has(user.username)}
                onToggleExpand={() => toggleExpand(user.username)}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 px-4 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">
              {searchQuery ? "No users match your search" : "No users found"}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? `No user matching "${searchQuery}" was found in organization '${organization}'.`
                : "No user accounts were returned in this access report."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
