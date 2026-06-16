package com.kstn.group4.backend.league;

import com.kstn.group4.backend.league.dto.LeagueStandingResponse;
import com.kstn.group4.backend.league.entity.League;
import com.kstn.group4.backend.league.enums.LeagueFormat;
import com.kstn.group4.backend.league.enums.LeagueStatus;
import com.kstn.group4.backend.league.repository.LeagueRepository;
import com.kstn.group4.backend.league.service.LeagueService;
import com.kstn.group4.backend.match.dto.MatchResultSubmitRequest;
import com.kstn.group4.backend.match.dto.PlayerStatDto;
import com.kstn.group4.backend.match.entity.Match;
import com.kstn.group4.backend.match.enums.MatchSkillLevel;
import com.kstn.group4.backend.match.enums.MatchStatus;
import com.kstn.group4.backend.match.repository.MatchRepository;
import com.kstn.group4.backend.match.service.MatchService;
import com.kstn.group4.backend.statistics.dto.TopPlayerStatDto;
import com.kstn.group4.backend.team.entity.Team;
import com.kstn.group4.backend.team.enums.TeamStatus;
import com.kstn.group4.backend.team.repository.TeamRepository;
import com.kstn.group4.backend.user.entity.User;
import com.kstn.group4.backend.user.repository.UserRepository;
import com.kstn.group4.backend.venue.entity.Venue;
import com.kstn.group4.backend.venue.repository.VenueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class LeagueStandingIntegrationTest {

    @Autowired
    private MatchService matchService;

    @Autowired
    private LeagueService leagueService;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private LeagueRepository leagueRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VenueRepository venueRepository;

    private League testLeague;
    private Team teamA;
    private Team teamB;
    private User player1;
    private User player2;
    private Match testMatch;

    @BeforeEach
    void setUp() {
        // 1. Create Manager/Users
        User manager = new User();
        manager.setUsername("manager");
        manager.setEmail("manager@test.com");
        manager = userRepository.save(manager);

        player1 = new User();
        player1.setUsername("player1");
        player1.setEmail("p1@test.com");
        player1 = userRepository.save(player1);

        player2 = new User();
        player2.setUsername("player2");
        player2.setEmail("p2@test.com");
        player2 = userRepository.save(player2);

        // 2. Create League
        testLeague = new League();
        testLeague.setName("V-League Test");
        testLeague.setFormat(LeagueFormat.ROUND_ROBIN);
        testLeague.setNumberOfTeams(2);
        testLeague.setStatus(LeagueStatus.OPENING);
        testLeague.setManager(manager);
        testLeague = leagueRepository.save(testLeague);

        // 3. Create Teams
        teamA = new Team();
        teamA.setName("Team A");
        teamA.setCaptain(player1);
        teamA.setStatus(TeamStatus.APPROVED);
        teamA = teamRepository.save(teamA);

        teamB = new Team();
        teamB.setName("Team B");
        teamB.setCaptain(player2);
        teamB.setStatus(TeamStatus.APPROVED);
        teamB = teamRepository.save(teamB);

        // 4. Create Venue (needed for match)
        Venue venue = new Venue();
        venue.setName("Test Stadium");
        venue.setManagerId(manager.getId());
        venue.setOpenTime(LocalTime.of(8, 0));
        venue.setCloseTime(LocalTime.of(22, 0));
        venue = venueRepository.save(venue);

        // 5. Create Match
        testMatch = new Match();
        testMatch.setLeague(testLeague);
        testMatch.setVenue(venue);
        testMatch.setHostTeam(teamA);
        testMatch.setGuestTeam(teamB);
        testMatch.setSkillLevel(MatchSkillLevel.AVERAGE);
        testMatch.setMatchTime(LocalDateTime.now().plusDays(1));
        testMatch.setStatus(MatchStatus.SCHEDULED);
        testMatch = matchRepository.save(testMatch);
    }

    @Test
    void testSubmitMatchResult_UpdatesStandingsAndStats() {
        // Arrange: Team A wins 2-1 against Team B
        // Player 1 (Team A) scores 2 goals, Player 2 (Team B) scores 1 goal and Player 1 (Team A) gets 1 assist? No, lets keep it simple.
        MatchResultSubmitRequest request = new MatchResultSubmitRequest();
        request.setHomeScore(2);
        request.setAwayScore(1);
        
        PlayerStatDto p1Stat = new PlayerStatDto(player1.getId(), teamA.getId(), 2, 0);
        PlayerStatDto p2Stat = new PlayerStatDto(player2.getId(), teamB.getId(), 1, 1); // p2 scores 1, assists 1
        request.setPlayerStats(List.of(p1Stat, p2Stat));

        // Act
        matchService.submitMatchResult(testMatch.getId(), request);

        // Assert 1: Standings updated correctly
        List<LeagueStandingResponse> standings = leagueService.getLeagueStandings(testLeague.getId());
        assertThat(standings).hasSize(2);
        
        // Team A should be first (3 points)
        LeagueStandingResponse first = standings.get(0);
        assertThat(first.getTeamName()).isEqualTo("Team A");
        assertThat(first.getPlayed()).isEqualTo(1);
        assertThat(first.getWon()).isEqualTo(1);
        assertThat(first.getPoints()).isEqualTo(3);
        assertThat(first.getGoalsFor()).isEqualTo(2);
        assertThat(first.getGoalsAgainst()).isEqualTo(1);
        assertThat(first.getGoalDifference()).isEqualTo(1);

        // Team B should be second (0 points)
        LeagueStandingResponse second = standings.get(1);
        assertThat(second.getTeamName()).isEqualTo("Team B");
        assertThat(second.getPlayed()).isEqualTo(1);
        assertThat(second.getLost()).isEqualTo(1);
        assertThat(second.getPoints()).isEqualTo(0);
        assertThat(second.getGoalsFor()).isEqualTo(1);
        assertThat(second.getGoalsAgainst()).isEqualTo(2);

        // Assert 2: Player stats updated correctly
        List<TopPlayerStatDto> scorers = leagueService.getTopScorers(testLeague.getId());
        assertThat(scorers).isNotEmpty();
        assertThat(scorers.get(0).getPlayerName()).isEqualTo("player1");
        assertThat(scorers.get(0).getTotalValue()).isEqualTo(2);

        List<TopPlayerStatDto> assists = leagueService.getTopAssists(testLeague.getId());
        assertThat(assists).isNotEmpty();
        assertThat(assists.get(0).getPlayerName()).isEqualTo("player2");
        assertThat(assists.get(0).getTotalValue()).isEqualTo(1);
    }

    @Test
    void testUpdateMatchResult_UpdatesStandingsAndStatsCorrectlyWithoutDuplicates() {
        // 1. Submit result: Team A wins 2-1 against Team B
        MatchResultSubmitRequest request1 = new MatchResultSubmitRequest();
        request1.setHomeScore(2);
        request1.setAwayScore(1);
        
        PlayerStatDto p1Stat1 = new PlayerStatDto(player1.getId(), teamA.getId(), 2, 0);
        PlayerStatDto p2Stat1 = new PlayerStatDto(player2.getId(), teamB.getId(), 1, 1);
        request1.setPlayerStats(List.of(p1Stat1, p2Stat1));

        matchService.submitMatchResult(testMatch.getId(), request1);

        // 2. Update result of the same match: Team B wins 3-1 against Team A (swap scores)
        MatchResultSubmitRequest request2 = new MatchResultSubmitRequest();
        request2.setHomeScore(1);
        request2.setAwayScore(3);
        
        PlayerStatDto p1Stat2 = new PlayerStatDto(player1.getId(), teamA.getId(), 1, 0);
        PlayerStatDto p2Stat2 = new PlayerStatDto(player2.getId(), teamB.getId(), 3, 0);
        request2.setPlayerStats(List.of(p1Stat2, p2Stat2));

        matchService.submitMatchResult(testMatch.getId(), request2);

        // Assert 1: Standings updated correctly (old scores reverted, new scores applied)
        List<LeagueStandingResponse> standings = leagueService.getLeagueStandings(testLeague.getId());
        assertThat(standings).hasSize(2);
        
        // Team B should now be first (3 points, won 1, lost 0, played 1)
        LeagueStandingResponse first = standings.get(0);
        assertThat(first.getTeamName()).isEqualTo("Team B");
        assertThat(first.getPlayed()).isEqualTo(1);
        assertThat(first.getWon()).isEqualTo(1);
        assertThat(first.getPoints()).isEqualTo(3);
        assertThat(first.getGoalsFor()).isEqualTo(3);
        assertThat(first.getGoalsAgainst()).isEqualTo(1);
        assertThat(first.getGoalDifference()).isEqualTo(2);

        // Team A should now be second (0 points, won 0, lost 1, played 1)
        LeagueStandingResponse second = standings.get(1);
        assertThat(second.getTeamName()).isEqualTo("Team A");
        assertThat(second.getPlayed()).isEqualTo(1);
        assertThat(second.getLost()).isEqualTo(1);
        assertThat(second.getPoints()).isEqualTo(0);
        assertThat(second.getGoalsFor()).isEqualTo(1);
        assertThat(second.getGoalsAgainst()).isEqualTo(3);
        assertThat(second.getGoalDifference()).isEqualTo(-2);

        // Assert 2: Player stats are replaced completely (no duplicates)
        List<TopPlayerStatDto> scorers = leagueService.getTopScorers(testLeague.getId());
        assertThat(scorers).isNotEmpty();
        // player2 should be first with 3 goals (from second submission, not 1 + 3 = 4)
        assertThat(scorers.get(0).getPlayerName()).isEqualTo("player2");
        assertThat(scorers.get(0).getTotalValue()).isEqualTo(3);
        
        // player1 should be second with 1 goal (from second submission, not 2 + 1 = 3)
        assertThat(scorers.get(1).getPlayerName()).isEqualTo("player1");
        assertThat(scorers.get(1).getTotalValue()).isEqualTo(1);
    }
}
