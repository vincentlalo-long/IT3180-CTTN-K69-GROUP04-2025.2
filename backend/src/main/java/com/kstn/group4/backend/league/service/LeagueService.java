package com.kstn.group4.backend.league.service;

import com.kstn.group4.backend.league.dto.LeagueRequest;
import com.kstn.group4.backend.league.dto.LeagueResponse;
import com.kstn.group4.backend.league.dto.LeagueStandingResponse;
import com.kstn.group4.backend.statistics.dto.TopPlayerStatDto;

import com.kstn.group4.backend.match.dto.MatchResponse;

import java.util.List;

public interface LeagueService {
    List<LeagueResponse> getAllLeagues();
    List<LeagueResponse> getLeaguesByManagerId(Integer managerId);
    LeagueResponse getLeagueById(Integer id);
    LeagueResponse createLeague(LeagueRequest request, Integer managerId);
    LeagueResponse updateLeague(Integer id, LeagueRequest request, Integer managerId);
    void deleteLeague(Integer id, Integer managerId);
    List<LeagueStandingResponse> getLeagueStandings(Integer leagueId);
    List<TopPlayerStatDto> getTopScorers(Integer leagueId);
    List<TopPlayerStatDto> getTopAssists(Integer leagueId);
    List<MatchResponse> generateSchedule(Integer leagueId, Integer managerId);
    List<MatchResponse> getLeagueMatches(Integer leagueId);
}
