package com.kstn.group4.backend.team.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Embeddable
public class TeamMemberId implements Serializable {

    @Column(name = "team_id")
    private Integer teamId;

    @Column(name = "user_email")
    private String userEmail;

    public TeamMemberId() {
    }

    public TeamMemberId(Integer teamId, String userEmail) {
        this.teamId = teamId;
        this.userEmail = userEmail;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TeamMemberId that = (TeamMemberId) o;
        return Objects.equals(teamId, that.teamId) && Objects.equals(userEmail, that.userEmail);
    }

    @Override
    public int hashCode() {
        return Objects.hash(teamId, userEmail);
    }
}
