"use client";

import React, { useState, useMemo } from "react";
import { Search, Users, ChevronDown, ChevronUp } from "lucide-react";
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
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              aria-label="Search users by username"
            />
          </div>

          {filteredUsers.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExpandAll}
              className="text-xs shrink-0 self-end sm:self-center border border-slate-800 hover:border-slate-700"
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
