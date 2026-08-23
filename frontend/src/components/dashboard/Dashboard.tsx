import React from "react";
import { FolderGit2 } from "lucide-react";
import { AccessReport } from "@/types/access-report";
import { SummaryCards } from "./SummaryCards";
import { UserAccessTable } from "./UserAccessTable";

interface DashboardProps {
  report: AccessReport;
}

export function Dashboard({ report }: DashboardProps) {
  const hasRepositories = report.totalRepositories > 0 || (report.users && report.users.length > 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Summary Cards Grid */}
      <SummaryCards
        organization={report.organization}
        totalRepositories={report.totalRepositories}
        totalUsers={report.totalUsers}
        generatedAt={report.generatedAt}
      />

      {/* Main Content Area */}
      {hasRepositories ? (
        <UserAccessTable users={report.users || []} organization={report.organization} />
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-400">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">
            No repositories found
          </h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            No repositories were found for organization &apos;{report.organization}&apos;.
          </p>
        </div>
      )}
    </div>
  );
}
