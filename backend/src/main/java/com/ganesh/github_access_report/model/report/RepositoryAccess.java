package com.ganesh.github_access_report.model.report;

public record RepositoryAccess(
        String repositoryName,
        String repositoryFullName,
        String permission
) implements Comparable<RepositoryAccess> {

    @Override
    public int compareTo(RepositoryAccess o) {
        return this.repositoryName.compareToIgnoreCase(o.repositoryName);
    }
}
