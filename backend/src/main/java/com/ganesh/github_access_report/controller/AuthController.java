package com.ganesh.github_access_report.controller;

import com.ganesh.github_access_report.model.github.OAuthTokenResponse;
import com.ganesh.github_access_report.service.OAuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

@RestController
@CrossOrigin(origins = "*")
public class AuthController {

    private final OAuthService oAuthService;

    public AuthController(OAuthService oAuthService) {
        this.oAuthService = oAuthService;
    }

    @GetMapping({"/auth/github", "/api/v1/auth/github"})
    public RedirectView redirectToGitHubOAuth(
            @RequestParam(value = "state", required = false) String state
    ) {
        String authUrl = oAuthService.buildAuthorizationUrl(state);
        return new RedirectView(authUrl);
    }

    @GetMapping({"/auth/github/callback", "/api/v1/auth/github/callback"})
    public ResponseEntity<OAuthTokenResponse> handleGitHubCallback(
            @RequestParam("code") String code,
            @RequestParam(value = "state", required = false) String state
    ) {
        OAuthTokenResponse tokenResponse = oAuthService.exchangeCodeForToken(code);
        return ResponseEntity.ok(tokenResponse);
    }
}
