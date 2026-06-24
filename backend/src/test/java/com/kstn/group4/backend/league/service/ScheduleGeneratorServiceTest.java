package com.kstn.group4.backend.league.service;

import com.kstn.group4.backend.league.dto.MatchPairingDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

class ScheduleGeneratorServiceTest {

    private ScheduleGeneratorService scheduleGeneratorService;

    @BeforeEach
    void setUp() {
        scheduleGeneratorService = new ScheduleGeneratorServiceImpl();
    }

    @Test
    void testGenerateRoundRobin_EvenTeams() {
        List<Integer> teams = Arrays.asList(1, 2, 3, 4);
        List<MatchPairingDto> schedule = scheduleGeneratorService.generateRoundRobin(teams);

        // N = 4, Total matches = 4/2 * (4-1) = 6
        assertEquals(6, schedule.size());

        // Max round number should be N-1 = 3
        int maxRound = schedule.stream().mapToInt(MatchPairingDto::getRoundNumber).max().orElse(0);
        assertEquals(3, maxRound);
        
        // Count matches per team
        long team1Matches = schedule.stream().filter(m -> Objects.equals(m.getHomeTeamId(), 1) || Objects.equals(m.getAwayTeamId(), 1)).count();
        assertEquals(3, team1Matches);
    }

    @Test
    void testGenerateRoundRobin_OddTeams() {
        List<Integer> teams = Arrays.asList(1, 2, 3);
        List<MatchPairingDto> schedule = scheduleGeneratorService.generateRoundRobin(teams);

        // N=3 becomes 4. Matches = 4/2 * 3 = 6
        assertEquals(6, schedule.size());

        // Max round = 3
        int maxRound = schedule.stream().mapToInt(MatchPairingDto::getRoundNumber).max().orElse(0);
        assertEquals(3, maxRound);

        // Check if BYEs exist (null team)
        long byes = schedule.stream().filter(m -> m.getHomeTeamId() == null || m.getAwayTeamId() == null).count();
        assertEquals(3, byes); // 3 rounds, 1 BYE per round
    }

    @Test
    void testGenerateRoundRobin_InvalidInput() {
        assertThrows(IllegalArgumentException.class, () -> scheduleGeneratorService.generateRoundRobin(Arrays.asList(1)));
        assertThrows(IllegalArgumentException.class, () -> scheduleGeneratorService.generateRoundRobin(null));
    }

    @Test
    void testGenerateKnockout_PowerOfTwo() {
        List<Integer> teams = Arrays.asList(1, 2, 3, 4);
        List<MatchPairingDto> schedule = scheduleGeneratorService.generateKnockout(teams);

        // N = 4 (power of 2). Total matches = 4 - 1 = 3
        assertEquals(3, schedule.size());
        
        // 2 matches in round 1, 1 match in round 2
        long round1Count = schedule.stream().filter(m -> m.getRoundNumber() == 1).count();
        assertEquals(2, round1Count);
        
        long round2Count = schedule.stream().filter(m -> m.getRoundNumber() == 2).count();
        assertEquals(1, round2Count);

        // No BYEs
        long byes = schedule.stream().filter(m -> m.getRoundNumber() == 1 && (m.getHomeTeamId() == null || m.getAwayTeamId() == null)).count();
        assertEquals(0, byes);
    }

    @Test
    void testGenerateKnockout_NotPowerOfTwo() {
        List<Integer> teams = Arrays.asList(1, 2, 3, 4, 5);
        List<MatchPairingDto> schedule = scheduleGeneratorService.generateKnockout(teams);

        // N = 5. P = 8. Total matches = 8 - 1 = 7.
        assertEquals(7, schedule.size());

        // P = 8, so Round 1 has 4 matches.
        long round1Count = schedule.stream().filter(m -> m.getRoundNumber() == 1).count();
        assertEquals(4, round1Count);
        
        // BYEs = P - N = 8 - 5 = 3
        long byes = schedule.stream().filter(m -> m.getRoundNumber() == 1 && (m.getHomeTeamId() == null || m.getAwayTeamId() == null)).count();
        assertEquals(3, byes);
    }
    
    @Test
    void testGenerateKnockout_InvalidInput() {
        assertThrows(IllegalArgumentException.class, () -> scheduleGeneratorService.generateKnockout(Arrays.asList(1)));
        assertThrows(IllegalArgumentException.class, () -> scheduleGeneratorService.generateKnockout(null));
    }
}
