package com.kstn.group4.backend.team.dto;

import com.kstn.group4.backend.team.enums.TeamStatus;
import com.kstn.group4.backend.match.enums.MatchSkillLevel;
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
    private MatchSkillLevel skillLevel;
    private LocalDateTime bannedUntil;
    private LocalDateTime createdAt;
    private List<String> memberEmails;
    private List<TeamMemberResponse> members;

    public TeamResponse(
            Long id,
            String name,
            Integer captainId,
            String captainName,
            String description,
            Integer reputationScore,
            TeamStatus status,
            MatchSkillLevel skillLevel,
            LocalDateTime bannedUntil,
            LocalDateTime createdAt,
            List<String> memberEmails
    ) {
        this(
                id,
                name,
                captainId,
                captainName,
                description,
                reputationScore,
                status,
                skillLevel,
                bannedUntil,
                createdAt,
                memberEmails,
                null
        );
    }
}
