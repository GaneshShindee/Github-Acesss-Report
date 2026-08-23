package com.ganesh.github_access_report.model.github;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GitHubCollaborator(
        @JsonProperty("id") Long id,
        @JsonProperty("login") String login,
        @JsonProperty("role_name") String roleName,
        @JsonProperty("permissions") GitHubPermissions permissions
) {
    public String resolvePermission() {
        if (permissions != null) {
            if (permissions.admin()) {
                return "admin";
            }
            if (permissions.maintain()) {
                return "maintain";
            }
            if (permissions.push()) {
                return "push";
            }
            if (permissions.triage()) {
                return "triage";
            }
            if (permissions.pull()) {
                return "pull";
            }
        }
        if (roleName != null && !roleName.isBlank()) {
            if ("write".equalsIgnoreCase(roleName)) {
                return "push";
            }
            if ("read".equalsIgnoreCase(roleName)) {
                return "pull";
            }
            return roleName.toLowerCase();
        }
        return "pull";
    }
}
