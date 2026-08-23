package com.ganesh.github_access_report.client;

import com.ganesh.github_access_report.config.GitHubProperties;
import com.ganesh.github_access_report.exception.GitHubApiException;
import com.ganesh.github_access_report.exception.OrganizationNotFoundException;
import com.ganesh.github_access_report.model.github.GitHubCollaborator;
import com.ganesh.github_access_report.model.github.GitHubOrg;
import com.ganesh.github_access_report.model.github.GitHubRepository;
import com.ganesh.github_access_report.model.github.GitHubUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.ArrayList;
import java.util.List;

@Component
public class GitHubApiClient implements GitHubClient {

    private static final Logger log = LoggerFactory.getLogger(GitHubApiClient.class);

    private final RestClient restClient;
    private final GitHubProperties properties;

    public GitHubApiClient(RestClient restClient, GitHubProperties properties) {
        this.restClient = restClient;
        this.properties = properties;
    }

    @Override
    public GitHubUser getAuthenticatedUser(String authToken) {
        log.debug("Fetching authenticated user details");
        try {
            RestClient.RequestHeadersSpec<?> spec = restClient.get().uri("/user");
            spec = applyAuthorizationHeader(spec, authToken);

            return spec.retrieve()
                    .onStatus(HttpStatusCode::isError, (req, resp) -> handleHttpError(resp.getStatusCode(), "user", "authenticated user"))
                    .body(GitHubUser.class);
        } catch (RestClientResponseException ex) {
            handleException(ex, "user", "authenticated user");
            return null;
        }
    }

    @Override
    public List<GitHubOrg> getUserOrganizations(String authToken) {
        log.debug("Fetching organizations for authenticated user");
        try {
            RestClient.RequestHeadersSpec<?> spec = restClient.get().uri("/user/orgs?per_page=100");
            spec = applyAuthorizationHeader(spec, authToken);

            List<GitHubOrg> orgs = spec.retrieve()
                    .onStatus(HttpStatusCode::isError, (req, resp) -> handleHttpError(resp.getStatusCode(), "user/orgs", "user organizations"))
                    .body(new ParameterizedTypeReference<List<GitHubOrg>>() {});

            return orgs != null ? orgs : List.of();
        } catch (RestClientResponseException ex) {
            log.warn("Unable to fetch user organizations: {}", ex.getMessage());
            return List.of();
        }
    }

    @Override
    public List<GitHubRepository> getOrganizationRepositories(String organization) {
        return getOrganizationRepositories(organization, null);
    }

    @Override
    public List<GitHubRepository> getOrganizationRepositories(String organization, String authToken) {
        log.debug("Fetching repositories for organization: {}", organization);
        List<GitHubRepository> allRepositories = new ArrayList<>();
        int page = 1;
        int pageSize = properties.pageSize();

        while (true) {
            final int currentPage = page;
            try {
                RestClient.RequestHeadersSpec<?> spec = restClient.get()
                        .uri("/orgs/{org}/repos?per_page={perPage}&page={page}", organization, pageSize, currentPage);

                spec = applyAuthorizationHeader(spec, authToken);

                List<GitHubRepository> pageRepos = spec.retrieve()
                        .onStatus(HttpStatusCode::isError, (req, resp) -> handleHttpError(resp.getStatusCode(), organization, "organization repos"))
                        .body(new ParameterizedTypeReference<List<GitHubRepository>>() {});

                if (pageRepos == null || pageRepos.isEmpty()) {
                    break;
                }

                allRepositories.addAll(pageRepos);

                if (pageRepos.size() < pageSize) {
                    break;
                }
                page++;
            } catch (RestClientResponseException ex) {
                handleException(ex, organization, "organization repos");
            }
        }

        log.debug("Fetched {} repositories for organization {}", allRepositories.size(), organization);
        return allRepositories;
    }

    @Override
    public List<GitHubCollaborator> getRepositoryCollaborators(String organization, String repository) {
        return getRepositoryCollaborators(organization, repository, null);
    }

    @Override
    public List<GitHubCollaborator> getRepositoryCollaborators(String organization, String repository, String authToken) {
        log.debug("Fetching collaborators for repository {}/{}", organization, repository);
        List<GitHubCollaborator> allCollaborators = new ArrayList<>();
        int page = 1;
        int pageSize = properties.pageSize();

        while (true) {
            final int currentPage = page;
            try {
                RestClient.RequestHeadersSpec<?> spec = restClient.get()
                        .uri("/repos/{org}/{repo}/collaborators?per_page={perPage}&page={page}", organization, repository, pageSize, currentPage);

                spec = applyAuthorizationHeader(spec, authToken);

                List<GitHubCollaborator> pageCollaborators = spec.retrieve()
                        .onStatus(HttpStatusCode::isError, (req, resp) -> handleHttpError(resp.getStatusCode(), organization, "repository collaborators"))
                        .body(new ParameterizedTypeReference<List<GitHubCollaborator>>() {});

                if (pageCollaborators == null || pageCollaborators.isEmpty()) {
                    break;
                }

                allCollaborators.addAll(pageCollaborators);

                if (pageCollaborators.size() < pageSize) {
                    break;
                }
                page++;
            } catch (RestClientResponseException ex) {
                handleException(ex, organization, "repository collaborators");
            }
        }

        log.debug("Fetched {} collaborators for repository {}/{}", allCollaborators.size(), organization, repository);
        return allCollaborators;
    }

    private RestClient.RequestHeadersSpec<?> applyAuthorizationHeader(RestClient.RequestHeadersSpec<?> spec, String authToken) {
        String tokenToUse = (authToken != null && !authToken.isBlank()) ? authToken : properties.token();

        if (tokenToUse != null && !tokenToUse.isBlank()) {
            String token = tokenToUse.trim();
            if (token.startsWith("Bearer ") || token.startsWith("token ")) {
                return spec.header("Authorization", token);
            }
            return spec.header("Authorization", "Bearer " + token);
        }
        return spec;
    }

    private void handleHttpError(HttpStatusCode status, String resource, String context) {
        int code = status.value();
        if (code == 404) {
            throw new OrganizationNotFoundException(resource);
        } else if (code == 401) {
            throw new GitHubApiException("Unauthorized access to GitHub API for " + resource + ". Invalid or expired GitHub token.", 401);
        } else if (code == 403) {
            throw new GitHubApiException("Access forbidden or GitHub API rate limit exceeded for " + resource, 403);
        } else {
            throw new GitHubApiException("GitHub API error (" + code + ") while fetching " + context + " for " + resource, code);
        }
    }

    private void handleException(RestClientResponseException ex, String resource, String context) {
        int code = ex.getStatusCode().value();
        if (code == 404) {
            throw new OrganizationNotFoundException(resource);
        } else if (code == 401) {
            throw new GitHubApiException("Unauthorized access to GitHub API for " + resource + ". Invalid or expired GitHub token.", 401);
        } else if (code == 403) {
            throw new GitHubApiException("Access forbidden or GitHub API rate limit exceeded for " + resource, 403);
        } else {
            throw new GitHubApiException("GitHub API error (" + code + ") while fetching " + context + " for " + resource, code, ex);
        }
    }
}
