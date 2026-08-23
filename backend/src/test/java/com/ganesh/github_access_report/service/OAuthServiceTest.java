package com.ganesh.github_access_report.service;

import com.ganesh.github_access_report.config.GitHubProperties;
import com.ganesh.github_access_report.exception.GitHubApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestClient;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class OAuthServiceTest {

    @Mock
    private RestClient restClient;

    private GitHubProperties properties;
    private OAuthService oAuthService;

    @BeforeEach
    void setUp() {
        properties = new GitHubProperties(
                "https://api.github.com",
                "",
                "test-client-id",
                "test-client-secret",
                "http://localhost:8080/auth/github/callback",
                100, 10, 10
        );
        oAuthService = new OAuthService(properties, restClient);
    }

    @Test
    void buildAuthorizationUrl_Success() {
        String url = oAuthService.buildAuthorizationUrl("state-123");
        assertNotNull(url);
        assertTrue(url.contains("client_id=test-client-id"));
        assertTrue(url.contains("scope=read:org%20repo"));
        assertTrue(url.contains("redirect_uri=http://localhost:8080/auth/github/callback"));
        assertTrue(url.contains("state=state-123"));
    }

    @Test
    void buildAuthorizationUrl_MissingClientId_ThrowsException() {
        GitHubProperties emptyProps = new GitHubProperties(
                "https://api.github.com", "", "", "", "", 100, 10, 10
        );
        OAuthService service = new OAuthService(emptyProps, restClient);
        assertThrows(GitHubApiException.class, () -> service.buildAuthorizationUrl(null));
    }
}
