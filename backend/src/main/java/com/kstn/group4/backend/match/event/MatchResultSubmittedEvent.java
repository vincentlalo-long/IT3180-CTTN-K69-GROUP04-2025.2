package com.kstn.group4.backend.match.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MatchResultSubmittedEvent {
    private final Integer matchId;
    private final Integer leagueId;
    private final Long homeTeamId;
    private final Long awayTeamId;
    private final Integer homeScore;
    private final Integer awayScore;
    private final Integer oldHomeScore;
    private final Integer oldAwayScore;
    private final boolean isUpdate;

    public MatchResultSubmittedEvent(Integer matchId, Integer leagueId, Long homeTeamId, Long awayTeamId, Integer homeScore, Integer awayScore) {
        this.matchId = matchId;
        this.leagueId = leagueId;
        this.homeTeamId = homeTeamId;
        this.awayTeamId = awayTeamId;
        this.homeScore = homeScore;
        this.awayScore = awayScore;
        this.oldHomeScore = null;
        this.oldAwayScore = null;
        this.isUpdate = false;
    }
}
