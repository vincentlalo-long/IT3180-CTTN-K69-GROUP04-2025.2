package com.kstn.group4.backend.league.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchPairingDto {
    private Integer matchId;
    private Integer roundNumber;
    private Integer homeTeamId;
    private Integer awayTeamId;
    private Integer nextMatchId;
}
