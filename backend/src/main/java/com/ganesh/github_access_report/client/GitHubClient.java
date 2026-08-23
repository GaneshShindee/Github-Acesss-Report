package com.ganesh.github_access_report.client;

import com.ganesh.github_access_report.model.github.GitHubCollaborator;
import com.ganesh.github_access_report.model.github.GitHubRepository;

import java.util.List;

public interface GitHubClient {

    List<GitHubRepository> getOrganizationRepositories(String organization);

    List<GitHubCollaborator> getRepositoryCollaborators(String organization, String repository);
}
