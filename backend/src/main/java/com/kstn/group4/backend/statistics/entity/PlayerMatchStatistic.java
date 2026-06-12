package com.kstn.group4.backend.statistics.entity;

import com.kstn.group4.backend.match.entity.Match;
import com.kstn.group4.backend.team.entity.Team;
import com.kstn.group4.backend.user.entity.User;
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
@Table(name = "player_match_statistics")
@SuppressWarnings("JpaDataSourceORMInspection")
public class PlayerMatchStatistic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id", nullable = false)
    private User player;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @Column(name = "goals", nullable = false)
    private Integer goals = 0;

    @Column(name = "assists", nullable = false)
    private Integer assists = 0;

    @Column(name = "yellow_cards", nullable = false)
    private Integer yellowCards = 0;

    @Column(name = "red_cards", nullable = false)
    private Integer redCards = 0;
}
