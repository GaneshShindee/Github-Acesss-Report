import { PermissionType } from "@/types/access-report";

/**
 * Format ISO date string into a human-readable format.
 * Example: 2026-08-24T10:30:00Z -> "24 Aug 2026, 10:30 AM"
 */
export function formatDate(isoString: string): string {
  if (!isoString) return "N/A";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return isoString;
  }
}

export interface PermissionBadgeConfig {
  label: string;
  badgeStyle: string;
  borderStyle: string;
  dotColor: string;
  description: string;
}

/**
 * Visual styling and metadata for permission levels.
 */
export function getPermissionConfig(permission: PermissionType): PermissionBadgeConfig {
  const norm = (permission || "").toUpperCase();

  switch (norm) {
    case "ADMIN":
      return {
        label: "ADMIN",
        badgeStyle: "bg-rose-500/10 text-rose-400 border-rose-500/30",
        borderStyle: "border-rose-500/30",
        dotColor: "bg-rose-400",
        description: "Full access (read, write, manage permissions)",
      };
    case "MAINTAIN":
      return {
        label: "MAINTAIN",
        badgeStyle: "bg-purple-500/10 text-purple-400 border-purple-500/30",
        borderStyle: "border-purple-500/30",
        dotColor: "bg-purple-400",
        description: "Manage repository without sensitive actions",
      };
    case "PUSH":
    case "WRITE":
      return {
        label: "PUSH",
        badgeStyle: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        borderStyle: "border-amber-500/30",
        dotColor: "bg-amber-400",
        description: "Read & write access (push to branches)",
      };
    case "TRIAGE":
      return {
        label: "TRIAGE",
        badgeStyle: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        borderStyle: "border-blue-500/30",
        dotColor: "bg-blue-400",
        description: "Manage issues and pull requests",
      };
    case "PULL":
    case "READ":
      return {
        label: "PULL",
        badgeStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        borderStyle: "border-emerald-500/30",
        dotColor: "bg-emerald-400",
        description: "Read-only access to repository",
      };
    default:
      return {
        label: norm || "UNKNOWN",
        badgeStyle: "bg-slate-500/10 text-slate-400 border-slate-500/30",
        borderStyle: "border-slate-500/30",
        dotColor: "bg-slate-400",
        description: "Custom or unspecified permission level",
      };
  }
}
