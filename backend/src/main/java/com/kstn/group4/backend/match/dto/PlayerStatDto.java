package com.kstn.group4.backend.match.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlayerStatDto {
    private Integer playerId;
    private Long teamId;
    private Integer goals;
    private Integer assists;
}
