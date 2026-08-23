package com.ganesh.github_access_report.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties(prefix = "github")
public record GitHubProperties(
        @DefaultValue("https://api.github.com") String baseUrl,
        @DefaultValue("") String token,
        @DefaultValue("") String clientId,
        @DefaultValue("") String clientSecret,
        @DefaultValue("http://localhost:8080/auth/github/callback") String redirectUri,
        @DefaultValue("100") int pageSize,
        @DefaultValue("10") int concurrency,
        @DefaultValue("10") int timeoutSeconds
) {
}
