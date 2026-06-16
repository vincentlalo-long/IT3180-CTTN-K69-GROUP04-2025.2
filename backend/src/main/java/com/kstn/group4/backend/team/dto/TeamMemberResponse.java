package com.kstn.group4.backend.team.dto;

import com.kstn.group4.backend.team.enums.TeamMemberStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TeamMemberResponse {
    private String email;
    private TeamMemberStatus status;
    private Integer id;
    private String username;

    public TeamMemberResponse(String email, TeamMemberStatus status) {
        this.email = email;
        this.status = status;
        this.id = null;
        this.username = null;
    }
}
