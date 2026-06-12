package com.kstn.group4.backend.league.entity;

import com.kstn.group4.backend.team.entity.Team;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "league_standings", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"league_id", "team_id"})
})
@SuppressWarnings("JpaDataSourceORMInspection")
public class LeagueStanding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "league_id", nullable = false)
    private League league;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @Column(name = "played", nullable = false)
    private Integer played = 0;

    @Column(name = "won", nullable = false)
    private Integer won = 0;

    @Column(name = "drawn", nullable = false)
    private Integer drawn = 0;

    @Column(name = "lost", nullable = false)
    private Integer lost = 0;

    @Column(name = "goals_for", nullable = false)
    private Integer goalsFor = 0;

    @Column(name = "goals_against", nullable = false)
    private Integer goalsAgainst = 0;

    @Column(name = "goal_difference", nullable = false)
    private Integer goalDifference = 0;

    @Column(name = "points", nullable = false)
    private Integer points = 0;
}
