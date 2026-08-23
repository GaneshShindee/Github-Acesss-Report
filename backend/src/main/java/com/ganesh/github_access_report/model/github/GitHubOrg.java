package com.ganesh.github_access_report.model.github;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GitHubOrg(
        String login,
        String description,
        @JsonProperty("avatar_url") String avatarUrl
) {
}
