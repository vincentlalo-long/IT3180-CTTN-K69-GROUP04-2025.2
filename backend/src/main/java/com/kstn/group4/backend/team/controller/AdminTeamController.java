package com.kstn.group4.backend.team.controller;

import com.kstn.group4.backend.team.dto.TeamResponse;
import com.kstn.group4.backend.team.dto.TeamStatusUpdateRequest;
import com.kstn.group4.backend.team.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping({"/admin/teams", "/api/v1/admin/teams"})
@PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
public class AdminTeamController {

    private final TeamService teamService;

    @GetMapping("/pending")
    public ResponseEntity<List<TeamResponse>> getPendingTeams() {
        return ResponseEntity.ok(teamService.getPendingTeams());
    }

    @GetMapping
    public ResponseEntity<List<TeamResponse>> getAllTeams() {
        return ResponseEntity.ok(teamService.getAllTeams());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TeamResponse> updateTeamStatus(
            @PathVariable Integer id,
            @Valid @RequestBody TeamStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(teamService.updateTeamStatus(id, request));
    }
}
