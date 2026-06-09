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
}
