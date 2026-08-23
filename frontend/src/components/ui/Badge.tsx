import React from "react";
import { PermissionType } from "@/types/access-report";
import { getPermissionConfig } from "@/lib/utils";

interface BadgeProps {
  permission: PermissionType;
  showDot?: boolean;
  className?: string;
  title?: string;
}

export function Badge({ permission, showDot = true, className = "", title }: BadgeProps) {
  const config = getPermissionConfig(permission);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border shadow-sm ${config.badgeStyle} ${className}`}
      title={title || config.description}
      aria-label={`Permission: ${config.label}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotColor}`} aria-hidden="true" />
      )}
      <span>{config.label}</span>
    </span>
  );
}
