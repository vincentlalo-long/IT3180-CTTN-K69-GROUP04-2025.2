package com.kstn.group4.backend.league.dto;

import com.kstn.group4.backend.league.enums.RegistrationStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class RegistrationResponse {
    private Integer id;
    private Integer leagueId;
    private String leagueName;
    private Long teamId;
    private String teamName;
    private Integer captainId;
    private String captainName;
    private RegistrationStatus status;
    private LocalDateTime createdAt;
}
