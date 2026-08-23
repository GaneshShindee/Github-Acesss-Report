package com.ganesh.github_access_report.model.report;

import java.time.Instant;
import java.util.List;

public record AccessReport(
        String organization,
        Instant generatedAt,
        int totalRepositories,
        int totalUsers,
        List<UserAccess> users
) {
}
