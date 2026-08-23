package com.ganesh.github_access_report.controller;

import com.ganesh.github_access_report.client.GitHubClient;
import com.ganesh.github_access_report.config.GitHubProperties;
import com.ganesh.github_access_report.exception.GitHubApiException;
import com.ganesh.github_access_report.model.github.GitHubOrg;
import com.ganesh.github_access_report.model.github.GitHubUser;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/user")
@CrossOrigin(origins = "*")
public class UserController {

    private final GitHubClient gitHubClient;
    private final GitHubProperties properties;

    public UserController(GitHubClient gitHubClient, GitHubProperties properties) {
        this.gitHubClient = gitHubClient;
        this.properties = properties;
    }

    @GetMapping("/me")
    public ResponseEntity<GitHubUser> getAuthenticatedUser(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        String token = extractToken(authHeader);
        GitHubUser user = gitHubClient.getAuthenticatedUser(token);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    @GetMapping("/orgs")
    public ResponseEntity<List<GitHubOrg>> getUserOrganizations(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        String token = extractToken(authHeader);
        List<GitHubOrg> orgs = gitHubClient.getUserOrganizations(token);
        return ResponseEntity.ok(orgs);
    }

    private String extractToken(String authHeader) {
        if (authHeader != null && !authHeader.isBlank()) {
            String trimmed = authHeader.trim();
            if (trimmed.startsWith("Bearer ")) {
                return trimmed.substring(7).trim();
            } else if (trimmed.startsWith("token ")) {
                return trimmed.substring(6).trim();
            }
            return trimmed;
        }

        if (properties.token() != null && !properties.token().isBlank()) {
            return properties.token().trim();
        }

        throw new GitHubApiException("Authentication required. Please provide a valid GitHub token in the 'Authorization: Bearer <token>' header.", 401);
    }
}
