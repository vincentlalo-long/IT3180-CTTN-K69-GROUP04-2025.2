package com.kstn.group4.backend.team.controller;

import com.kstn.group4.backend.config.security.services.UserPrincipal;
import com.kstn.group4.backend.team.dto.CreateTeamRequest;
import com.kstn.group4.backend.team.dto.TeamResponse;
import com.kstn.group4.backend.team.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/teams")
public class TeamController {

    private final TeamService teamService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('PLAYER', 'ROLE_PLAYER', 'ADMIN')")
    public ResponseEntity<TeamResponse> createTeam(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateTeamRequest request
    ) {
        TeamResponse response = teamService.createTeam(userPrincipal, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my-team")
    @PreAuthorize("hasAnyAuthority('PLAYER', 'ROLE_PLAYER', 'ADMIN')")
    public ResponseEntity<TeamResponse> getMyTeam(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        TeamResponse response = teamService.getMyTeam(userPrincipal);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('PLAYER', 'ROLE_PLAYER', 'ADMIN')")
    public ResponseEntity<TeamResponse> getTeamDetails(@PathVariable Long id) {
        TeamResponse response = teamService.getTeamDetailsById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('PLAYER', 'ROLE_PLAYER', 'ADMIN')")
    public ResponseEntity<List<TeamResponse>> getApprovedTeams() {
        return ResponseEntity.ok(teamService.getApprovedTeams());
    }
}
