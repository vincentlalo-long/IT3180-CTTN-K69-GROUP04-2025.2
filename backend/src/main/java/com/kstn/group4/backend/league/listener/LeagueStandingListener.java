package com.kstn.group4.backend.league.listener;

import com.kstn.group4.backend.league.entity.League;
import com.kstn.group4.backend.league.entity.LeagueStanding;
import com.kstn.group4.backend.league.repository.LeagueRepository;
import com.kstn.group4.backend.league.repository.LeagueStandingRepository;
import com.kstn.group4.backend.match.event.MatchResultSubmittedEvent;
import com.kstn.group4.backend.team.entity.Team;
import com.kstn.group4.backend.team.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class LeagueStandingListener {

    private final LeagueStandingRepository leagueStandingRepository;
    private final LeagueRepository leagueRepository;
    private final TeamRepository teamRepository;

    @EventListener
    @Transactional
    public void handleMatchResultSubmitted(MatchResultSubmittedEvent event) {
        if (event.getLeagueId() == null) {
            log.info("Match {} is not part of a league. Skipping standing update.", event.getMatchId());
            return;
        }

        log.info("Updating standings for league {} after match {}", event.getLeagueId(), event.getMatchId());

        League league = leagueRepository.findById(event.getLeagueId()).orElse(null);
        if (league == null) return;

        updateTeamStanding(league, event.getHomeTeamId(), event.getHomeScore(), event.getAwayScore());
        updateTeamStanding(league, event.getAwayTeamId(), event.getAwayScore(), event.getHomeScore());
    }

    private void updateTeamStanding(League league, Long teamId, Integer goalsFor, Integer goalsAgainst) {
        if (teamId == null) return;

        LeagueStanding standing = leagueStandingRepository.findByLeagueIdAndTeamId(league.getId(), teamId)
                .orElseGet(() -> {
                    LeagueStanding newStanding = new LeagueStanding();
                    newStanding.setLeague(league);
                    Team team = teamRepository.findById(teamId).orElse(null);
                    if (team == null) return null;
                    newStanding.setTeam(team);
                    return newStanding;
                });

        if (standing == null) return;

        standing.setPlayed(standing.getPlayed() + 1);
        standing.setGoalsFor(standing.getGoalsFor() + goalsFor);
        standing.setGoalsAgainst(standing.getGoalsAgainst() + goalsAgainst);
        standing.setGoalDifference(standing.getGoalsFor() - standing.getGoalsAgainst());

        if (goalsFor > goalsAgainst) {
            standing.setWon(standing.getWon() + 1);
            standing.setPoints(standing.getPoints() + 3);
        } else if (goalsFor.equals(goalsAgainst)) {
            standing.setDrawn(standing.getDrawn() + 1);
            standing.setPoints(standing.getPoints() + 1);
        } else {
            standing.setLost(standing.getLost() + 1);
        }

        leagueStandingRepository.save(standing);
    }
}
