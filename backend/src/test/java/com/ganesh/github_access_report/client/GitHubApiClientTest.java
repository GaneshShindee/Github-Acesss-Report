package com.ganesh.github_access_report.client;

import com.ganesh.github_access_report.config.GitHubProperties;
import com.ganesh.github_access_report.exception.GitHubApiException;
import com.ganesh.github_access_report.exception.OrganizationNotFoundException;
import com.ganesh.github_access_report.model.github.GitHubCollaborator;
import com.ganesh.github_access_report.model.github.GitHubRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class GitHubApiClientTest {

    private RestClient restClient;
    private MockRestServiceServer mockServer;
    private GitHubApiClient client;

    @BeforeEach
    void setUp() {
        GitHubProperties properties = new GitHubProperties("https://api.github.com", "test-token", "client-id", "client-secret", "http://localhost:8080/auth/github/callback", 2, 5, 10);
        RestClient.Builder builder = RestClient.builder().baseUrl("https://api.github.com");
        mockServer = MockRestServiceServer.bindTo(builder).build();
        restClient = builder.build();
        client = new GitHubApiClient(restClient, properties);
    }

    @Test
    void getOrganizationRepositories_PaginationAndHeaders() {
        String page1Json = """
                [
                  {"id": 1, "name": "repo-1", "full_name": "my-org/repo-1", "private": false},
                  {"id": 2, "name": "repo-2", "full_name": "my-org/repo-2", "private": true}
                ]
                """;
        String page2Json = """
                [
                  {"id": 3, "name": "repo-3", "full_name": "my-org/repo-3", "private": false}
                ]
                """;

        mockServer.expect(requestTo("https://api.github.com/orgs/my-org/repos?per_page=2&page=1"))
                .andExpect(method(HttpMethod.GET))
                .andExpect(header(HttpHeaders.AUTHORIZATION, "Bearer test-token"))
                .andRespond(withSuccess(page1Json, MediaType.APPLICATION_JSON));

        mockServer.expect(requestTo("https://api.github.com/orgs/my-org/repos?per_page=2&page=2"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess(page2Json, MediaType.APPLICATION_JSON));

        List<GitHubRepository> repos = client.getOrganizationRepositories("my-org");

        assertEquals(3, repos.size());
        assertEquals("repo-1", repos.get(0).name());
        assertEquals("repo-2", repos.get(1).name());
        assertEquals("repo-3", repos.get(2).name());

        mockServer.verify();
    }

    @Test
    void getOrganizationRepositories_NotFound() {
        mockServer.expect(requestTo("https://api.github.com/orgs/unknown-org/repos?per_page=2&page=1"))
                .andRespond(withStatus(HttpStatus.NOT_FOUND));

        assertThrows(OrganizationNotFoundException.class, () -> client.getOrganizationRepositories("unknown-org"));
    }

    @Test
    void getOrganizationRepositories_Unauthorized() {
        mockServer.expect(requestTo("https://api.github.com/orgs/my-org/repos?per_page=2&page=1"))
                .andRespond(withStatus(HttpStatus.UNAUTHORIZED));

        GitHubApiException ex = assertThrows(GitHubApiException.class, () -> client.getOrganizationRepositories("my-org"));
        assertEquals(401, ex.getStatusCode());
    }

    @Test
    void getRepositoryCollaborators_Success() {
        String collaboratorsPage1Json = """
                [
                  {
                    "id": 101,
                    "login": "alice",
                    "role_name": "admin",
                    "permissions": {"admin": true, "maintain": false, "push": true, "triage": false, "pull": true}
                  },
                  {
                    "id": 102,
                    "login": "bob",
                    "role_name": "write",
                    "permissions": {"admin": false, "maintain": false, "push": true, "triage": false, "pull": true}
                  }
                ]
                """;

        mockServer.expect(requestTo("https://api.github.com/repos/my-org/repo-1/collaborators?per_page=2&page=1"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess(collaboratorsPage1Json, MediaType.APPLICATION_JSON));

        mockServer.expect(requestTo("https://api.github.com/repos/my-org/repo-1/collaborators?per_page=2&page=2"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess("[]", MediaType.APPLICATION_JSON));

        List<GitHubCollaborator> collaborators = client.getRepositoryCollaborators("my-org", "repo-1");

        assertEquals(2, collaborators.size());
        assertEquals("alice", collaborators.get(0).login());
        assertEquals("admin", collaborators.get(0).resolvePermission());
        assertEquals("bob", collaborators.get(1).login());
        assertEquals("push", collaborators.get(1).resolvePermission());

        mockServer.verify();
    }
}
