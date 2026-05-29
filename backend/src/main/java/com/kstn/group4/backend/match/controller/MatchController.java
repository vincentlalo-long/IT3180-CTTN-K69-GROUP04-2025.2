package com.kstn.group4.backend.match.controller;

import com.kstn.group4.backend.config.security.services.UserPrincipal;
import com.kstn.group4.backend.match.dto.CreateMatchRequest;
import com.kstn.group4.backend.match.dto.MatchResponse;
import com.kstn.group4.backend.match.enums.MatchSkillLevel;
import com.kstn.group4.backend.match.service.MatchService;
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
@RequestMapping("/matches")
public class MatchController {

    private final MatchService matchService;

    @PostMapping
    @PreAuthorize("hasAuthority('PLAYER')")
    public ResponseEntity<MatchResponse> createMatch(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateMatchRequest request
    ) {
        MatchResponse response = matchService.createMatch(userPrincipal, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<MatchResponse>> getOpenMatches(
            @RequestParam(required = false) Integer venueId,
            @RequestParam(required = false) MatchSkillLevel skillLevel
    ) {
        return ResponseEntity.ok(matchService.getOpenMatches(venueId, skillLevel));
    }

    @PostMapping("/{id}/join")
    @PreAuthorize("hasAuthority('PLAYER')")
    public ResponseEntity<MatchResponse> joinMatch(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Integer id
    ) {
        return ResponseEntity.ok(matchService.joinMatch(userPrincipal, id));
    }
}
