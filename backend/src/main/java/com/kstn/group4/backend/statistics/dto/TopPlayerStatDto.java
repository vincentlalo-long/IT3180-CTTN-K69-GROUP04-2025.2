package com.kstn.group4.backend.statistics.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopPlayerStatDto {
    private Integer playerId;
    private String playerName;
    private Long teamId;
    private String teamName;
    private Integer totalValue; // can be used for goals or assists
}
