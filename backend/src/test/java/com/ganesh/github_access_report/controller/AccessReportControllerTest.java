package com.ganesh.github_access_report.controller;

import com.ganesh.github_access_report.config.GitHubProperties;
import com.ganesh.github_access_report.exception.GitHubApiException;
import com.ganesh.github_access_report.exception.GlobalExceptionHandler;
import com.ganesh.github_access_report.exception.OrganizationNotFoundException;
import com.ganesh.github_access_report.model.report.AccessReport;
import com.ganesh.github_access_report.model.report.RepositoryAccess;
import com.ganesh.github_access_report.model.report.UserAccess;
import com.ganesh.github_access_report.service.AccessReportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AccessReportControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AccessReportService accessReportService;

    private GitHubProperties properties;

    @BeforeEach
    void setUp() {
        properties = new GitHubProperties("https://api.github.com", "test-token", "client-id", "client-secret", "http://localhost:8080/auth/github/callback", 100, 10, 10);
        AccessReportController controller = new AccessReportController(accessReportService, properties);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void getAccessReport_Success() throws Exception {
        String org = "example-org";
        RepositoryAccess repo = new RepositoryAccess("repo-one", "example-org/repo-one", "admin");
        UserAccess user = new UserAccess("alice", List.of(repo));
        AccessReport report = new AccessReport(org, Instant.parse("2026-08-24T10:30:00Z"), 1, 1, List.of(user));

        when(accessReportService.generateAccessReport(eq(org), eq("test-token"))).thenReturn(report);

        mockMvc.perform(get("/api/v1/organizations/{organization}/access-report", org)
                        .header("Authorization", "Bearer test-token")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.organization").value(org))
                .andExpect(jsonPath("$.totalRepositories").value(1))
                .andExpect(jsonPath("$.totalUsers").value(1))
                .andExpect(jsonPath("$.users[0].username").value("alice"))
                .andExpect(jsonPath("$.users[0].repositories[0].repositoryName").value("repo-one"))
                .andExpect(jsonPath("$.users[0].repositories[0].permission").value("admin"));
    }

    @Test
    void getAccessReport_NotFound() throws Exception {
        String org = "nonexistent";
        when(accessReportService.generateAccessReport(eq(org), eq("test-token"))).thenThrow(new OrganizationNotFoundException(org));

        mockMvc.perform(get("/api/v1/organizations/{organization}/access-report", org)
                        .header("Authorization", "Bearer test-token"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Organization Not Found"))
                .andExpect(jsonPath("$.message").value("GitHub organization 'nonexistent' was not found"));
    }

    @Test
    void getAccessReport_Unauthorized() throws Exception {
        String org = "secret-org";
        when(accessReportService.generateAccessReport(eq(org), eq("test-token")))
                .thenThrow(new GitHubApiException("Unauthorized access to GitHub API", 401));

        mockMvc.perform(get("/api/v1/organizations/{organization}/access-report", org)
                        .header("Authorization", "Bearer test-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }
}
