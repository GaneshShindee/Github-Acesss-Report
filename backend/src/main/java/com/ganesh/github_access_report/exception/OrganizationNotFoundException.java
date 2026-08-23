package com.ganesh.github_access_report.exception;

public class OrganizationNotFoundException extends RuntimeException {
    public OrganizationNotFoundException(String organization) {
        super("GitHub organization '" + organization + "' was not found");
    }
}
