import { AccessReport, ApiErrorResponse } from "@/types/access-report";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8080";

export class ApiError extends Error {
  status?: number;
  errorType?: string;

  constructor(message: string, status?: number, errorType?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errorType = errorType;
  }
}

/**
 * Fetches the GitHub organization access report from the Spring Boot backend API.
 * Endpoint: GET /api/v1/organizations/{organization}/access-report
 */
export async function getAccessReport(organization: string): Promise<AccessReport> {
  const trimmedOrg = organization.trim();
  if (!trimmedOrg) {
    throw new ApiError("Organization name cannot be empty.");
  }

  const encodedOrg = encodeURIComponent(trimmedOrg);
  const targetUrl = `${API_BASE_URL}/api/v1/organizations/${encodedOrg}/access-report`;

  let response: Response;
  try {
    response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
  } catch {
    throw new ApiError(
      `Unable to connect to the backend server at ${API_BASE_URL}. Please check if the Spring Boot service is running and accessible.`,
      0,
      "NETWORK_ERROR"
    );
  }

  if (!response.ok) {
    let errorMessage = `Failed to retrieve access report (Status ${response.status})`;
    let status = response.status;
    let errorType = response.statusText;

    try {
      const data: ApiErrorResponse = await response.json();
      if (data && data.message) {
        errorMessage = data.message;
      }
      if (data && data.error) {
        errorType = data.error;
      }
      if (data && data.status) {
        status = data.status;
      }
    } catch {
      // If response body is not JSON, construct standard error fallback message
      if (status === 404) {
        errorMessage = `GitHub organization '${trimmedOrg}' was not found.`;
      } else if (status === 401 || status === 403) {
        errorMessage = "Access unauthorized. Please check backend GitHub authentication credentials.";
      } else if (status === 429) {
        errorMessage = "GitHub API rate limit exceeded. Please try again later.";
      } else if (status >= 500) {
        errorMessage = "The backend encountered an internal error while fetching the access report.";
      }
    }

    throw new ApiError(errorMessage, status, errorType);
  }

  try {
    const data: AccessReport = await response.json();
    return data;
  } catch {
    throw new ApiError("Failed to parse the server response into a valid access report.");
  }
}
