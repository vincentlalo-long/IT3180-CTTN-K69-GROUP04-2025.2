package com.kstn.group4.backend.team.dto;

import com.kstn.group4.backend.team.enums.TeamStatus;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TeamResponse {
    private Long id;
    private String name;
    private Integer captainId;
    private String captainName;
    private String description;
    private Integer reputationScore;
    private TeamStatus status;
    private LocalDateTime bannedUntil;
    private LocalDateTime createdAt;
    private List<String> memberEmails;
}
