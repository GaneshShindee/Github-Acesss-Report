package com.ganesh.github_access_report.controller;

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

    public AccessReportController(AccessReportService accessReportService) {
        this.accessReportService = accessReportService;
    }

    @GetMapping("/{organization}/access-report")
    public ResponseEntity<AccessReport> getAccessReport(
            @PathVariable("organization") @NotBlank String organization
    ) {
        if (organization.trim().isEmpty()) {
            throw new IllegalArgumentException("Organization name must not be empty");
        }
        AccessReport report = accessReportService.generateAccessReport(organization.trim());
        return ResponseEntity.ok(report);
    }
}
