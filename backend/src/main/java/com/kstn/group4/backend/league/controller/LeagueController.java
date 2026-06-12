package com.kstn.group4.backend.league.controller;

import com.kstn.group4.backend.config.security.services.UserPrincipal;
import com.kstn.group4.backend.league.dto.LeagueRequest;
import com.kstn.group4.backend.league.dto.LeagueResponse;
import com.kstn.group4.backend.league.service.LeagueService;
import com.kstn.group4.backend.match.dto.MatchResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/admin/leagues")
@PreAuthorize("hasRole('ADMIN')")
public class LeagueController {

    private final LeagueService leagueService;

    public LeagueController(LeagueService leagueService) {
        this.leagueService = leagueService;
    }

    @GetMapping
    public ResponseEntity<List<LeagueResponse>> getAllLeagues() {
        // Có thể thay đổi thành getLeaguesByManagerId(userDetails.getId()) nếu admin chỉ quản lý giải đấu của họ
        List<LeagueResponse> leagues = leagueService.getAllLeagues();
        return ResponseEntity.ok(leagues);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeagueResponse> getLeagueById(@PathVariable Integer id) {
        LeagueResponse league = leagueService.getLeagueById(id);
        return ResponseEntity.ok(league);
    }

    @PostMapping
    public ResponseEntity<LeagueResponse> createLeague(
            @Valid @RequestBody LeagueRequest request,
            @AuthenticationPrincipal UserPrincipal userDetails) {
        LeagueResponse createdLeague = leagueService.createLeague(request, userDetails.getId());
        return new ResponseEntity<>(createdLeague, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LeagueResponse> updateLeague(
            @PathVariable Integer id,
            @Valid @RequestBody LeagueRequest request,
            @AuthenticationPrincipal UserPrincipal userDetails) {
        LeagueResponse updatedLeague = leagueService.updateLeague(id, request, userDetails.getId());
        return ResponseEntity.ok(updatedLeague);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLeague(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserPrincipal userDetails) {
        leagueService.deleteLeague(id, userDetails.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/generate-schedule")
    public ResponseEntity<List<MatchResponse>> generateSchedule(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserPrincipal userDetails) {
        List<MatchResponse> schedule = leagueService.generateSchedule(id, userDetails.getId());
        return ResponseEntity.ok(schedule);
    }

    @GetMapping("/{id}/matches")
    public ResponseEntity<List<MatchResponse>> getLeagueMatches(@PathVariable Integer id) {
        List<MatchResponse> matches = leagueService.getLeagueMatches(id);
        return ResponseEntity.ok(matches);
    }
}
