package com.kstn.group4.backend.league.service;

import com.kstn.group4.backend.league.dto.LeagueRequest;
import com.kstn.group4.backend.league.dto.LeagueResponse;

import java.util.List;

public interface LeagueService {
    List<LeagueResponse> getAllLeagues();
    List<LeagueResponse> getLeaguesByManagerId(Integer managerId);
    LeagueResponse getLeagueById(Integer id);
    LeagueResponse createLeague(LeagueRequest request, Integer managerId);
    LeagueResponse updateLeague(Integer id, LeagueRequest request, Integer managerId);
    void deleteLeague(Integer id, Integer managerId);
}
