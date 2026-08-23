import React from "react";
import { User, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { UserAccess } from "@/types/access-report";
import { Button } from "@/components/ui/Button";
import { RepositoryList } from "./RepositoryList";

interface UserAccessRowProps {
  user: UserAccess;
  organization: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function UserAccessRow({
  user,
  organization,
  isExpanded,
  onToggleExpand,
}: UserAccessRowProps) {
  const repoCount = user.repositories ? user.repositories.length : 0;
  const userProfileUrl = `https://github.com/${user.username}`;

  return (
    <div
      className={`border-b border-slate-800/80 transition-colors ${
        isExpanded ? "bg-slate-900/60" : "hover:bg-slate-900/30"
      }`}
    >
      {/* Table Row Content */}
      <div className="px-4 py-3.5 flex items-center justify-between gap-4">
        {/* User Column */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300 font-semibold text-xs shrink-0">
            {user.username ? user.username.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-100 text-sm truncate">
                {user.username}
              </span>
              <a
                href={userProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-300 transition-colors"
                title={`View @${user.username} on GitHub`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Repositories Count Column */}
        <div className="hidden sm:block text-slate-400 text-sm font-medium text-center w-36">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/50 text-xs">
            {repoCount} {repoCount === 1 ? "repository" : "repositories"}
          </span>
        </div>

        {/* Action Column */}
        <div className="flex items-center justify-end gap-2 shrink-0">
          <span className="sm:hidden text-xs text-slate-400">
            {repoCount} {repoCount === 1 ? "repo" : "repos"}
          </span>
          <Button
            variant={isExpanded ? "secondary" : "outline"}
            size="sm"
            onClick={onToggleExpand}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? "Collapse" : "Expand"} repositories for ${user.username}`}
            rightIcon={
              isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )
            }
          >
            {isExpanded ? "Hide" : "View"}
          </Button>
        </div>
      </div>

      {/* Expanded Repositories Details */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1">
          <RepositoryList repositories={user.repositories || []} organization={organization} />
        </div>
      )}
    </div>
  );
}
