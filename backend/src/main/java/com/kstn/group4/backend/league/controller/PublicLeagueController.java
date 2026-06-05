package com.kstn.group4.backend.league.controller;

import com.kstn.group4.backend.league.dto.LeagueResponse;
import com.kstn.group4.backend.league.service.LeagueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/leagues")
public class PublicLeagueController {

    private final LeagueService leagueService;

    public PublicLeagueController(LeagueService leagueService) {
        this.leagueService = leagueService;
    }

    @GetMapping
    public ResponseEntity<List<LeagueResponse>> getAllLeagues() {
        List<LeagueResponse> leagues = leagueService.getAllLeagues();
        return ResponseEntity.ok(leagues);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeagueResponse> getLeagueById(@PathVariable Integer id) {
        LeagueResponse league = leagueService.getLeagueById(id);
        return ResponseEntity.ok(league);
    }
}
