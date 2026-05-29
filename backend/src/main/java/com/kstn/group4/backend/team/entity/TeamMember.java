package com.kstn.group4.backend.team.entity;

import com.kstn.group4.backend.team.enums.TeamMemberStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "team_members")
public class TeamMember {

    @EmbeddedId
    private TeamMemberId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("teamId")
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TeamMemberStatus status;

    public TeamMember() {
    }

    public TeamMember(Team team, String userEmail, TeamMemberStatus status) {
        this.id = new TeamMemberId(team.getId(), userEmail);
        this.team = team;
        this.status = status;
    }
}
