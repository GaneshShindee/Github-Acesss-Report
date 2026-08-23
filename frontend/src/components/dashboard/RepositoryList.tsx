import React from "react";
import { FolderGit2, ExternalLink } from "lucide-react";
import { RepositoryAccess } from "@/types/access-report";
import { Badge } from "@/components/ui/Badge";

interface RepositoryListProps {
  repositories: RepositoryAccess[];
  organization: string;
}

export function RepositoryList({ repositories, organization }: RepositoryListProps) {
  // Sort repositories alphabetically by repositoryName
  const sortedRepos = [...repositories].sort((a, b) =>
    (a.repositoryName || "").localeCompare(b.repositoryName || "", undefined, {
      sensitivity: "base",
    })
  );

  if (sortedRepos.length === 0) {
    return (
      <div className="py-4 text-center text-xs text-slate-500 italic bg-slate-950/40 rounded-lg border border-slate-800/80">
        No repository permissions found for this user.
      </div>
    );
  }

  return (
    <div className="bg-slate-950/60 rounded-xl border border-slate-800/90 overflow-hidden shadow-inner">
      <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400">
        <span className="uppercase tracking-wider">Repository</span>
        <span className="uppercase tracking-wider">Permission</span>
      </div>
      <div className="divide-y divide-slate-800/60">
        {sortedRepos.map((repo, idx) => {
          const repoUrl = `https://github.com/${repo.repositoryFullName || `${organization}/${repo.repositoryName}`}`;

          return (
            <div
              key={`${repo.repositoryName}-${idx}`}
              className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-900/40 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FolderGit2 className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-slate-200 truncate">
                      {repo.repositoryName}
                    </span>
                    <a
                      href={repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-slate-300 transition-colors"
                      title={`View ${repo.repositoryFullName || repo.repositoryName} on GitHub`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  {repo.repositoryFullName && (
                    <p className="text-xs text-slate-500 truncate">{repo.repositoryFullName}</p>
                  )}
                </div>
              </div>

              <div className="shrink-0 self-start sm:self-center">
                <Badge permission={repo.permission} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
