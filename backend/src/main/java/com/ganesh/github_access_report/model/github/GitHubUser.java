package com.ganesh.github_access_report.model.github;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GitHubUser(
        String login,
        String name,
        @JsonProperty("avatar_url") String avatarUrl,
        @JsonProperty("html_url") String htmlUrl
) {
}
