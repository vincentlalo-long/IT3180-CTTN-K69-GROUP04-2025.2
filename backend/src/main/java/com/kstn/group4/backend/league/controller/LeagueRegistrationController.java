package com.kstn.group4.backend.league.controller;

import com.kstn.group4.backend.config.security.services.UserPrincipal;
import com.kstn.group4.backend.league.dto.RegistrationResponse;
import com.kstn.group4.backend.league.enums.RegistrationStatus;
import com.kstn.group4.backend.league.service.LeagueRegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/league-registrations")
@RequiredArgsConstructor
public class LeagueRegistrationController {

    private final LeagueRegistrationService registrationService;

    @PostMapping("/leagues/{leagueId}/teams/{teamId}")
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<RegistrationResponse> registerTeam(
            @PathVariable Integer leagueId,
            @PathVariable Long teamId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(registrationService.registerTeam(leagueId, teamId, userPrincipal.getId()));
    }

    @GetMapping("/leagues/{leagueId}")
    public ResponseEntity<List<RegistrationResponse>> getRegistrationsByLeague(@PathVariable Integer leagueId) {
        return ResponseEntity.ok(registrationService.getRegistrationsByLeague(leagueId));
    }

    @PatchMapping("/{registrationId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RegistrationResponse> updateRegistrationStatus(
            @PathVariable Integer registrationId,
            @RequestParam RegistrationStatus status,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(registrationService.updateRegistrationStatus(registrationId, status, userPrincipal.getId()));
    }

    @DeleteMapping("/{registrationId}")
    public ResponseEntity<Void> deleteRegistration(
            @PathVariable Integer registrationId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        registrationService.deleteRegistration(registrationId, userPrincipal.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/leagues/{leagueId}/finalize")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> finalizeRegistration(
            @PathVariable Integer leagueId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        registrationService.finalizeRegistration(leagueId, userPrincipal.getId());
        return ResponseEntity.ok().build();
    }
}
