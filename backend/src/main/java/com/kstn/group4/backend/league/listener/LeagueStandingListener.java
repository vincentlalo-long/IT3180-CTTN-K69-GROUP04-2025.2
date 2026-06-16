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

        if (event.isUpdate() && event.getOldHomeScore() != null && event.getOldAwayScore() != null) {
            log.info("Reverting old standings contribution: {} - {} for match {}", event.getOldHomeScore(), event.getOldAwayScore(), event.getMatchId());
            updateTeamStanding(league, event.getHomeTeamId(), event.getOldHomeScore(), event.getOldAwayScore(), true);
            updateTeamStanding(league, event.getAwayTeamId(), event.getOldAwayScore(), event.getOldHomeScore(), true);
        }

        updateTeamStanding(league, event.getHomeTeamId(), event.getHomeScore(), event.getAwayScore(), false);
        updateTeamStanding(league, event.getAwayTeamId(), event.getAwayScore(), event.getHomeScore(), false);
    }

    private void updateTeamStanding(League league, Long teamId, Integer goalsFor, Integer goalsAgainst, boolean isRevert) {
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

        int factor = isRevert ? -1 : 1;

        standing.setPlayed(standing.getPlayed() + factor);
        standing.setGoalsFor(standing.getGoalsFor() + (goalsFor * factor));
        standing.setGoalsAgainst(standing.getGoalsAgainst() + (goalsAgainst * factor));
        standing.setGoalDifference(standing.getGoalsFor() - standing.getGoalsAgainst());

        if (goalsFor > goalsAgainst) {
            standing.setWon(standing.getWon() + factor);
            standing.setPoints(standing.getPoints() + (3 * factor));
        } else if (goalsFor.equals(goalsAgainst)) {
            standing.setDrawn(standing.getDrawn() + factor);
            standing.setPoints(standing.getPoints() + factor);
        } else {
            standing.setLost(standing.getLost() + factor);
        }

        leagueStandingRepository.save(standing);
    }
}
