package com.ganesh.github_access_report.controller;

import com.ganesh.github_access_report.config.GitHubProperties;
import com.ganesh.github_access_report.exception.GitHubApiException;
import com.ganesh.github_access_report.model.report.AccessReport;
import com.ganesh.github_access_report.service.AccessReportService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/organizations")
@CrossOrigin(origins = "*")
@Validated
public class AccessReportController {

    private final AccessReportService accessReportService;
    private final GitHubProperties properties;

    public AccessReportController(AccessReportService accessReportService, GitHubProperties properties) {
        this.accessReportService = accessReportService;
        this.properties = properties;
    }

    @GetMapping("/{organization}/access-report")
    public ResponseEntity<AccessReport> getAccessReport(
            @PathVariable("organization") @NotBlank String organization,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        if (organization.trim().isEmpty()) {
            throw new IllegalArgumentException("Organization name must not be empty");
        }

        String token = extractToken(authHeader);

        AccessReport report = accessReportService.generateAccessReport(organization.trim(), token);
        return ResponseEntity.ok(report);
    }

    private String extractToken(String authHeader) {
        if (authHeader != null && !authHeader.isBlank()) {
            String trimmedHeader = authHeader.trim();
            if (trimmedHeader.startsWith("Bearer ")) {
                return trimmedHeader.substring(7).trim();
            } else if (trimmedHeader.startsWith("token ")) {
                return trimmedHeader.substring(6).trim();
            }
            return trimmedHeader;
        }

        if (properties.token() != null && !properties.token().isBlank()) {
            return properties.token().trim();
        }

        throw new GitHubApiException("Authentication required. Please provide a valid GitHub token in the 'Authorization: Bearer <token>' header or configure GITHUB_TOKEN.", 401);
    }
}
