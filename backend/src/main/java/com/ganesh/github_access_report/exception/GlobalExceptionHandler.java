package com.ganesh.github_access_report.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ExecutionException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(OrganizationNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleOrganizationNotFound(
            OrganizationNotFoundException ex,
            HttpServletRequest request
    ) {
        log.warn("Organization not found: {}", ex.getMessage());
        ErrorResponse errorResponse = new ErrorResponse(
                Instant.now(),
                HttpStatus.NOT_FOUND.value(),
                "Organization Not Found",
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    @ExceptionHandler(GitHubApiException.class)
    public ResponseEntity<ErrorResponse> handleGitHubApiException(
            GitHubApiException ex,
            HttpServletRequest request
    ) {
        log.error("GitHub API error (status {}): {}", ex.getStatusCode(), ex.getMessage());
        HttpStatus status = HttpStatus.resolve(ex.getStatusCode());
        if (status == null) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }

        String errorReason = status.getReasonPhrase();
        if (ex.getStatusCode() == 401) {
            errorReason = "Unauthorized";
        } else if (ex.getStatusCode() == 403) {
            errorReason = "Forbidden / Rate Limit Exceeded";
        }

        ErrorResponse errorResponse = new ErrorResponse(
                Instant.now(),
                status.value(),
                errorReason,
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(status).body(errorResponse);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(
            IllegalArgumentException ex,
            HttpServletRequest request
    ) {
        log.warn("Bad request: {}", ex.getMessage());
        ErrorResponse errorResponse = new ErrorResponse(
                Instant.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(
            IllegalStateException ex,
            HttpServletRequest request
    ) {
        log.warn("Configuration or Illegal State error: {}", ex.getMessage());
        ErrorResponse errorResponse = new ErrorResponse(
                Instant.now(),
                HttpStatus.BAD_REQUEST.value(),
                "OAuth Configuration Error",
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler({CompletionException.class, ExecutionException.class})
    public ResponseEntity<ErrorResponse> handleAsyncExecutionException(
            Exception ex,
            HttpServletRequest request
    ) {
        Throwable cause = ex.getCause() != null ? ex.getCause() : ex;
        if (cause instanceof OrganizationNotFoundException) {
            return handleOrganizationNotFound((OrganizationNotFoundException) cause, request);
        } else if (cause instanceof GitHubApiException) {
            return handleGitHubApiException((GitHubApiException) cause, request);
        }

        log.error("Async execution error while processing request {}: {}", request.getRequestURI(), cause.getMessage(), cause);
        ErrorResponse errorResponse = new ErrorResponse(
                Instant.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                cause.getMessage() != null ? cause.getMessage() : "An unexpected error occurred.",
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex,
            HttpServletRequest request
    ) {
        log.error("Unexpected error occurred while processing request: {}", request.getRequestURI(), ex);
        String detailMessage = (ex.getMessage() != null && !ex.getMessage().isBlank())
                ? ex.getMessage()
                : "An unexpected error occurred. Please try again later.";
        ErrorResponse errorResponse = new ErrorResponse(
                Instant.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                detailMessage,
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}
