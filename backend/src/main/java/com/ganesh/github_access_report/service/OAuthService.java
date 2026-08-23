package com.ganesh.github_access_report.service;

import com.ganesh.github_access_report.config.GitHubProperties;
import com.ganesh.github_access_report.exception.GitHubApiException;
import com.ganesh.github_access_report.model.github.OAuthTokenResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.HashMap;
import java.util.Map;

@Service
public class OAuthService {

    private static final Logger log = LoggerFactory.getLogger(OAuthService.class);

    private final GitHubProperties properties;
    private final RestClient restClient;

    public OAuthService(GitHubProperties properties, RestClient restClient) {
        this.properties = properties;
        this.restClient = restClient;
    }

    public String buildAuthorizationUrl(String state) {
        String clientId = properties.clientId();
        if (clientId == null || clientId.isBlank()) {
            throw new IllegalStateException("GitHub OAuth Client ID is not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in backend/.env, or use your Personal Access Token (PAT).");
        }

        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString("https://github.com/login/oauth/authorize")
                .queryParam("client_id", clientId)
                .queryParam("scope", "read:org repo")
                .queryParam("redirect_uri", properties.redirectUri());

        if (state != null && !state.isBlank()) {
            builder.queryParam("state", state);
        }

        return builder.toUriString();
    }

    public OAuthTokenResponse exchangeCodeForToken(String code) {
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Authorization code must not be empty");
        }

        String clientId = properties.clientId();
        String clientSecret = properties.clientSecret();

        if (clientId == null || clientId.isBlank() || clientSecret == null || clientSecret.isBlank()) {
            throw new IllegalStateException("GitHub OAuth credentials (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET) are not configured in backend/.env.");
        }

        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("client_id", clientId);
        requestBody.put("client_secret", clientSecret);
        requestBody.put("code", code);
        requestBody.put("redirect_uri", properties.redirectUri());

        log.debug("Exchanging authorization code for GitHub access token");

        try {
            OAuthTokenResponse response = restClient.post()
                    .uri("https://github.com/login/oauth/access_token")
                    .accept(MediaType.APPLICATION_JSON)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(OAuthTokenResponse.class);

            if (response == null || response.accessToken() == null) {
                String errorMsg = (response != null && response.errorDescription() != null)
                        ? response.errorDescription()
                        : "Failed to obtain access token from GitHub";
                log.error("GitHub OAuth token exchange failed: {}", errorMsg);
                throw new GitHubApiException(errorMsg, 400);
            }

            log.info("Successfully exchanged authorization code for GitHub access token");
            return response;

        } catch (Exception ex) {
            if (ex instanceof GitHubApiException || ex instanceof IllegalStateException) {
                throw ex;
            }
            log.error("Error during GitHub OAuth token exchange", ex);
            throw new GitHubApiException("Failed to exchange OAuth code for access token: " + ex.getMessage(), 400, ex);
        }
    }
}
