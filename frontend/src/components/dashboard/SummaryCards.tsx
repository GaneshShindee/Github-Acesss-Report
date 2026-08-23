import React from "react";
import { Building2, FolderGit2, Users, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

interface SummaryCardsProps {
  organization: string;
  totalRepositories: number;
  totalUsers: number;
  generatedAt: string;
}

export function SummaryCards({
  organization,
  totalRepositories,
  totalUsers,
  generatedAt,
}: SummaryCardsProps) {
  const cards = [
    {
      title: "Organization",
      value: organization,
      icon: <Building2 className="w-5 h-5 text-indigo-400" />,
      bgGradient: "from-indigo-500/10 to-indigo-600/5",
      borderColor: "border-indigo-500/20",
    },
    {
      title: "Total Repositories",
      value: totalRepositories.toLocaleString(),
      icon: <FolderGit2 className="w-5 h-5 text-blue-400" />,
      bgGradient: "from-blue-500/10 to-blue-600/5",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Total Users",
      value: totalUsers.toLocaleString(),
      icon: <Users className="w-5 h-5 text-cyan-400" />,
      bgGradient: "from-cyan-500/10 to-cyan-600/5",
      borderColor: "border-cyan-500/20",
    },
    {
      title: "Generated At",
      value: formatDate(generatedAt),
      icon: <Clock className="w-5 h-5 text-emerald-400" />,
      bgGradient: "from-emerald-500/10 to-emerald-600/5",
      borderColor: "border-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card
          key={index}
          className={`bg-gradient-to-br ${card.bgGradient} ${card.borderColor} border relative overflow-hidden`}
          hoverEffect
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {card.title}
            </span>
            <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800 shrink-0">
              {card.icon}
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl sm:text-2xl font-bold text-white truncate" title={String(card.value)}>
              {card.value}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
