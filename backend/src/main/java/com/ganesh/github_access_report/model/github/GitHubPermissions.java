package com.ganesh.github_access_report.model.github;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GitHubPermissions(
        @JsonProperty("admin") boolean admin,
        @JsonProperty("maintain") boolean maintain,
        @JsonProperty("push") boolean push,
        @JsonProperty("triage") boolean triage,
        @JsonProperty("pull") boolean pull
) {
}
