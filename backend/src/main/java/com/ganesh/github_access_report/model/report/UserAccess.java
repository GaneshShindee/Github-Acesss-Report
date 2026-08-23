package com.ganesh.github_access_report.model.report;

import java.util.List;

public record UserAccess(
        String username,
        List<RepositoryAccess> repositories
) implements Comparable<UserAccess> {

    @Override
    public int compareTo(UserAccess o) {
        return this.username.compareToIgnoreCase(o.username);
    }
}
