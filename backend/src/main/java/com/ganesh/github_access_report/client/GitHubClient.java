package com.ganesh.github_access_report.client;

import com.ganesh.github_access_report.model.github.GitHubCollaborator;
import com.ganesh.github_access_report.model.github.GitHubOrg;
import com.ganesh.github_access_report.model.github.GitHubRepository;
import com.ganesh.github_access_report.model.github.GitHubUser;

import java.util.List;

public interface GitHubClient {

    GitHubUser getAuthenticatedUser(String authToken);

    List<GitHubOrg> getUserOrganizations(String authToken);

    List<GitHubRepository> getOrganizationRepositories(String organization);

    List<GitHubRepository> getOrganizationRepositories(String organization, String authToken);

    List<GitHubCollaborator> getRepositoryCollaborators(String organization, String repository);

    List<GitHubCollaborator> getRepositoryCollaborators(String organization, String repository, String authToken);
}
