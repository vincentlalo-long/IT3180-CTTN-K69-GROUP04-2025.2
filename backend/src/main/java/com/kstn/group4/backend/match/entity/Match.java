package com.kstn.group4.backend.match.entity;

import com.kstn.group4.backend.team.entity.Team;
import com.kstn.group4.backend.venue.entity.Venue;
import com.kstn.group4.backend.match.enums.MatchSkillLevel;
import com.kstn.group4.backend.match.enums.MatchStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "matches")
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id", nullable = false)
    private Venue venue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_team_id", nullable = false)
    private Team hostTeam;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_team_id")
    private Team guestTeam;

    @Enumerated(EnumType.STRING)
    @Column(name = "skill_level", nullable = false)
    private MatchSkillLevel skillLevel;

    @Column(name = "match_time", nullable = false)
    private LocalDateTime matchTime;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MatchStatus status;

    public Match() {
        this.status = MatchStatus.OPEN;
    }
}
