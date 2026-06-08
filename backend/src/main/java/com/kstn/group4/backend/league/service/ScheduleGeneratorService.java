package com.kstn.group4.backend.league.service;

import com.kstn.group4.backend.league.dto.MatchPairingDto;
import java.util.List;

public interface ScheduleGeneratorService {
    
    /**
     * Generates a Round-Robin schedule for the given list of team IDs.
     * 
     * @param teamIds List of team IDs participating in the league.
     * @return List of MatchPairingDto representing the schedule.
     */
    List<MatchPairingDto> generateRoundRobin(List<Integer> teamIds);

    /**
     * Generates a Single Elimination Knockout schedule for the given list of team IDs.
     * 
     * @param teamIds List of team IDs participating in the tournament.
     * @return List of MatchPairingDto representing the knockout bracket.
     */
    List<MatchPairingDto> generateKnockout(List<Integer> teamIds);
}
