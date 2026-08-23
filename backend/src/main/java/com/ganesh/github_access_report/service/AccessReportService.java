package com.ganesh.github_access_report.service;

import com.ganesh.github_access_report.client.GitHubClient;
import com.ganesh.github_access_report.config.GitHubProperties;
import com.ganesh.github_access_report.model.github.GitHubCollaborator;
import com.ganesh.github_access_report.model.github.GitHubRepository;
import com.ganesh.github_access_report.model.report.AccessReport;
import com.ganesh.github_access_report.model.report.RepositoryAccess;
import com.ganesh.github_access_report.model.report.UserAccess;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

@Service
public class AccessReportService {

    private static final Logger log = LoggerFactory.getLogger(AccessReportService.class);

    private final GitHubClient gitHubClient;
    private final GitHubProperties properties;

    public AccessReportService(GitHubClient gitHubClient, GitHubProperties properties) {
        this.gitHubClient = gitHubClient;
        this.properties = properties;
    }

    public AccessReport generateAccessReport(String organization) {
        log.info("Starting access report generation for organization: {}", organization);

        List<GitHubRepository> repositories = gitHubClient.getOrganizationRepositories(organization);
        log.info("Found {} repositories for organization {}", repositories.size(), organization);

        if (repositories.isEmpty()) {
            log.info("Completed access report generation for organization {} with 0 repositories and 0 users", organization);
            return new AccessReport(organization, Instant.now(), 0, 0, List.of());
        }

        int concurrencyLimit = Math.max(1, properties.concurrency());
        Semaphore semaphore = new Semaphore(concurrencyLimit);

        Map<String, List<RepositoryAccess>> userRepoMap = new ConcurrentHashMap<>();

        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            List<CompletableFuture<Void>> futures = repositories.stream()
                    .map(repo -> CompletableFuture.runAsync(() -> {
                        try {
                            semaphore.acquire();
                            try {
                                fetchAndAggregateRepoCollaborators(organization, repo, userRepoMap);
                            } finally {
                                semaphore.release();
                            }
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                            throw new RuntimeException("Thread interrupted while waiting for concurrency permit", e);
                        }
                    }, executor))
                    .toList();

            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        }

        List<UserAccess> userAccessList = userRepoMap.entrySet().stream()
                .map(entry -> {
                    String username = entry.getKey();
                    List<RepositoryAccess> userRepos = entry.getValue().stream()
                            .sorted(Comparator.comparing(RepositoryAccess::repositoryName, String.CASE_INSENSITIVE_ORDER))
                            .collect(Collectors.toList());
                    return new UserAccess(username, userRepos);
                })
                .sorted(Comparator.comparing(UserAccess::username, String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());

        log.info("Completed access report generation for organization {}. Total repositories: {}, Total users: {}",
                organization, repositories.size(), userAccessList.size());

        return new AccessReport(
                organization,
                Instant.now(),
                repositories.size(),
                userAccessList.size(),
                userAccessList
        );
    }

    private void fetchAndAggregateRepoCollaborators(
            String organization,
            GitHubRepository repo,
            Map<String, List<RepositoryAccess>> userRepoMap
    ) {
        List<GitHubCollaborator> collaborators = gitHubClient.getRepositoryCollaborators(organization, repo.name());
        for (GitHubCollaborator collaborator : collaborators) {
            if (collaborator.login() == null || collaborator.login().isBlank()) {
                continue;
            }
            RepositoryAccess access = new RepositoryAccess(
                    repo.name(),
                    repo.fullName() != null ? repo.fullName() : organization + "/" + repo.name(),
                    collaborator.resolvePermission()
            );
            userRepoMap.computeIfAbsent(collaborator.login(), k -> Collections.synchronizedList(new ArrayList<>()))
                    .add(access);
        }
    }
}
