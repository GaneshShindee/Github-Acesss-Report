package com.ganesh.github_access_report.controller;

import com.ganesh.github_access_report.model.github.OAuthTokenResponse;
import com.ganesh.github_access_report.service.OAuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

@RestController
@CrossOrigin(origins = "*")
public class AuthController {

    private final OAuthService oAuthService;
    private final String frontendUrl;

    public AuthController(
            OAuthService oAuthService,
            @Value("${frontend.url:http://localhost:3000}") String frontendUrl
    ) {
        this.oAuthService = oAuthService;
        this.frontendUrl = frontendUrl;
    }

    @GetMapping({"/auth/github", "/api/v1/auth/github"})
    public RedirectView redirectToGitHubOAuth(
            @RequestParam(value = "state", required = false) String state
    ) {
        String authUrl = oAuthService.buildAuthorizationUrl(state);
        return new RedirectView(authUrl);
    }

    @GetMapping({"/auth/github/callback", "/api/v1/auth/github/callback"})
    public RedirectView handleGitHubCallback(
            @RequestParam("code") String code,
            @RequestParam(value = "state", required = false) String state
    ) {
        OAuthTokenResponse tokenResponse = oAuthService.exchangeCodeForToken(code);
        String redirectTarget = frontendUrl.replaceAll("/$", "") + "?token=" + tokenResponse.accessToken();
        return new RedirectView(redirectTarget);
    }
}
