package com.kstn.group4.backend.match.controller;

import com.kstn.group4.backend.match.dto.MatchResultSubmitRequest;
import com.kstn.group4.backend.match.dto.MatchResponse;
import com.kstn.group4.backend.match.service.MatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/matches")
@PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
public class AdminMatchController {

    private final MatchService matchService;

    @GetMapping
    public ResponseEntity<List<MatchResponse>> getAllMatches(@RequestParam(required = false) Integer venueId) {
        return ResponseEntity.ok(matchService.getAllMatchesForAdmin(venueId));
    }

    @PutMapping("/{id}/result")
    public ResponseEntity<MatchResponse> submitResult(@PathVariable Integer id, @RequestBody MatchResultSubmitRequest request) {
        return ResponseEntity.ok(matchService.submitMatchResult(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMatch(@PathVariable Integer id) {
        matchService.deleteMatch(id);
        return ResponseEntity.noContent().build();
    }
}
