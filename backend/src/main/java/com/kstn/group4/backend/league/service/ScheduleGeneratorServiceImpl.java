package com.kstn.group4.backend.league.service;

import com.kstn.group4.backend.league.dto.MatchPairingDto;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class ScheduleGeneratorServiceImpl implements ScheduleGeneratorService {

    @Override
    public List<MatchPairingDto> generateRoundRobin(List<Integer> teamIds) {
        if (teamIds == null || teamIds.size() < 2) {
            throw new IllegalArgumentException("At least 2 teams are required to generate a schedule.");
        }

        List<MatchPairingDto> schedule = new ArrayList<>();
        List<Integer> teams = new ArrayList<>(teamIds);
        
        // If odd number of teams, add a dummy team (null) for BYE
        if (teams.size() % 2 != 0) {
            teams.add(null);
        }

        int numTeams = teams.size();
        int numDays = numTeams - 1;
        int halfSize = numTeams / 2;
        int matchIdCounter = 1;

        for (int day = 0; day < numDays; day++) {
            for (int i = 0; i < halfSize; i++) {
                Integer home = teams.get(i);
                Integer away = teams.get(numTeams - 1 - i);

                // Alternating home/away for the fixed team to be fair if applicable, 
                // but standard circle method usually keeps index 0 fixed.
                if (i == 0 && day % 2 != 0) {
                    Integer temp = home;
                    home = away;
                    away = temp;
                }

                schedule.add(MatchPairingDto.builder()
                        .matchId(matchIdCounter++)
                        .roundNumber(day + 1)
                        .homeTeamId(home)
                        .awayTeamId(away)
                        .build());
            }

            // Rotate teams: Keep index 0 fixed, rotate others clockwise
            Integer lastTeam = teams.remove(numTeams - 1);
            teams.add(1, lastTeam);
        }

        return schedule;
    }

    @Override
    public List<MatchPairingDto> generateKnockout(List<Integer> teamIds) {
        if (teamIds == null || teamIds.size() < 2) {
            throw new IllegalArgumentException("At least 2 teams are required to generate a schedule.");
        }

        List<Integer> teams = new ArrayList<>(teamIds);
        Collections.shuffle(teams); // Randomize seeding

        int n = teams.size();
        int p = 1;
        while (p < n) {
            p *= 2;
        }

        int byes = p - n;
        List<MatchPairingDto> schedule = new ArrayList<>();
        int matchIdCounter = 1;
        
        // First round matches
        List<MatchPairingDto> currentRoundMatches = new ArrayList<>();
        int teamIndex = 0;
        
        // Number of first round matches = (n - byes) / 2 = (n - (p - n)) / 2 = (2n - p) / 2
        int firstRoundMatchesCount = p / 2;
        
        // Allocate matches for round 1
        for (int i = 0; i < firstRoundMatchesCount; i++) {
            Integer home = null;
            Integer away = null;
            
            if (teamIndex < teams.size()) {
                home = teams.get(teamIndex++);
            }
            
            // Should this be a BYE?
            // If we have remaining BYEs, we assign them carefully. A simpler approach is to pair everyone, and if we run out of teams, it's a BYE.
            // Actually, a better distribution for BYEs:
            if (byes > 0) {
                byes--;
                // Away is null (BYE)
            } else {
                if (teamIndex < teams.size()) {
                    away = teams.get(teamIndex++);
                }
            }

            MatchPairingDto match = MatchPairingDto.builder()
                    .matchId(matchIdCounter++)
                    .roundNumber(1)
                    .homeTeamId(home)
                    .awayTeamId(away)
                    .build();
            
            currentRoundMatches.add(match);
            schedule.add(match);
        }

        // Build subsequent rounds
        int roundNum = 2;
        while (currentRoundMatches.size() > 1) {
            List<MatchPairingDto> nextRoundMatches = new ArrayList<>();
            for (int i = 0; i < currentRoundMatches.size(); i += 2) {
                MatchPairingDto m1 = currentRoundMatches.get(i);
                MatchPairingDto m2 = (i + 1 < currentRoundMatches.size()) ? currentRoundMatches.get(i + 1) : null;
                
                MatchPairingDto nextMatch = MatchPairingDto.builder()
                        .matchId(matchIdCounter++)
                        .roundNumber(roundNum)
                        .homeTeamId(null) // To be determined by m1 winner
                        .awayTeamId(null) // To be determined by m2 winner
                        .build();
                
                m1.setNextMatchId(nextMatch.getMatchId());
                if (m2 != null) {
                    m2.setNextMatchId(nextMatch.getMatchId());
                }
                
                nextRoundMatches.add(nextMatch);
                schedule.add(nextMatch);
            }
            currentRoundMatches = nextRoundMatches;
            roundNum++;
        }

        return schedule;
    }
}
