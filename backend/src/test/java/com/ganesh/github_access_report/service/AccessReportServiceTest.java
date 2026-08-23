package com.ganesh.github_access_report.service;

import com.ganesh.github_access_report.client.GitHubClient;
import com.ganesh.github_access_report.config.GitHubProperties;
import com.ganesh.github_access_report.model.github.GitHubCollaborator;
import com.ganesh.github_access_report.model.github.GitHubPermissions;
import com.ganesh.github_access_report.model.github.GitHubRepository;
import com.ganesh.github_access_report.model.report.AccessReport;
import com.ganesh.github_access_report.model.report.UserAccess;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccessReportServiceTest {

    @Mock
    private GitHubClient gitHubClient;

    private AccessReportService service;

    @BeforeEach
    void setUp() {
        GitHubProperties properties = new GitHubProperties("https://api.github.com", "token", 100, 5, 10);
        service = new AccessReportService(gitHubClient, properties);
    }

    @Test
    void generateAccessReport_AggregationAndSorting() {
        String org = "example-org";

        GitHubRepository repo1 = new GitHubRepository(1L, "repo-two", "example-org/repo-two", false, null);
        GitHubRepository repo2 = new GitHubRepository(2L, "repo-one", "example-org/repo-one", false, null);
        when(gitHubClient.getOrganizationRepositories(org)).thenReturn(List.of(repo1, repo2));

        GitHubCollaborator aliceRepo2 = new GitHubCollaborator(101L, "alice", null, new GitHubPermissions(false, false, true, false, true));
        GitHubCollaborator bobRepo2 = new GitHubCollaborator(102L, "bob", null, new GitHubPermissions(true, false, true, false, true));
        when(gitHubClient.getRepositoryCollaborators(org, "repo-two")).thenReturn(List.of(aliceRepo2, bobRepo2));

        GitHubCollaborator aliceRepo1 = new GitHubCollaborator(101L, "alice", null, new GitHubPermissions(true, false, true, false, true));
        GitHubCollaborator charlieRepo1 = new GitHubCollaborator(103L, "charlie", null, new GitHubPermissions(false, false, false, false, true));
        when(gitHubClient.getRepositoryCollaborators(org, "repo-one")).thenReturn(List.of(aliceRepo1, charlieRepo1));

        AccessReport report = service.generateAccessReport(org);

        assertNotNull(report);
        assertEquals(org, report.organization());
        assertEquals(2, report.totalRepositories());
        assertEquals(3, report.totalUsers());

        List<UserAccess> users = report.users();
        assertEquals("alice", users.get(0).username());
        assertEquals("bob", users.get(1).username());
        assertEquals("charlie", users.get(2).username());

        UserAccess alice = users.get(0);
        assertEquals(2, alice.repositories().size());
        assertEquals("repo-one", alice.repositories().get(0).repositoryName());
        assertEquals("admin", alice.repositories().get(0).permission());
        assertEquals("repo-two", alice.repositories().get(1).repositoryName());
        assertEquals("push", alice.repositories().get(1).permission());

        UserAccess charlie = users.get(2);
        assertEquals(1, charlie.repositories().size());
        assertEquals("repo-one", charlie.repositories().get(0).repositoryName());
        assertEquals("pull", charlie.repositories().get(0).permission());

        verify(gitHubClient).getOrganizationRepositories(org);
        verify(gitHubClient).getRepositoryCollaborators(org, "repo-two");
        verify(gitHubClient).getRepositoryCollaborators(org, "repo-one");
    }

    @Test
    void generateAccessReport_EmptyOrganization() {
        String org = "empty-org";
        when(gitHubClient.getOrganizationRepositories(org)).thenReturn(List.of());

        AccessReport report = service.generateAccessReport(org);

        assertNotNull(report);
        assertEquals(org, report.organization());
        assertEquals(0, report.totalRepositories());
        assertEquals(0, report.totalUsers());
        assertTrue(report.users().isEmpty());
    }
}
