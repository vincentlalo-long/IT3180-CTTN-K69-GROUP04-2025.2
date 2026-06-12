package com.kstn.group4.backend.match.dto;

import lombok.Data;
import java.util.List;

@Data
public class MatchResultSubmitRequest {
    private Integer homeScore;
    private Integer awayScore;
    private List<PlayerStatDto> playerStats;
}
