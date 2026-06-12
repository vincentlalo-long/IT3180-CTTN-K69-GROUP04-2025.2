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
}
