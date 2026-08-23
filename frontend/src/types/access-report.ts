export type PermissionType =
  | "ADMIN"
  | "MAINTAIN"
  | "PUSH"
  | "TRIAGE"
  | "PULL"
  | "UNKNOWN"
  | string;

export interface RepositoryAccess {
  repositoryName: string;
  repositoryFullName: string;
  permission: PermissionType;
}

export interface UserAccess {
  username: string;
  repositories: RepositoryAccess[];
}

export interface AccessReport {
  organization: string;
  generatedAt: string;
  totalRepositories: number;
  totalUsers: number;
  users: UserAccess[];
}

export interface ApiErrorResponse {
  timestamp?: string;
  status?: number;
  error?: string;
  message: string;
}
