package com.kstn.group4.backend.match.entity;

import com.kstn.group4.backend.league.entity.League;
import com.kstn.group4.backend.team.entity.Team;
import com.kstn.group4.backend.venue.entity.TimeSlot;
import com.kstn.group4.backend.venue.entity.Venue;
import com.kstn.group4.backend.match.enums.MatchSkillLevel;
import com.kstn.group4.backend.match.enums.MatchStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "matches")
@SuppressWarnings("JpaDataSourceORMInspection")
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "league_id")
    private League league;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id", nullable = false)
    private Venue venue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_team_id")
    private Team hostTeam;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_team_id")
    private Team guestTeam;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "time_slot_id")
    private TimeSlot timeSlot;

    @Column(name = "pitch_type")
    private Integer pitchType;

    @Enumerated(EnumType.STRING)
    @Column(name = "skill_level", nullable = false)
    private MatchSkillLevel skillLevel;

    @Column(name = "match_time", nullable = false)
    private LocalDateTime matchTime;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private MatchStatus status = MatchStatus.OPEN;

    @Column(name = "home_score")
    private Integer homeScore;

    @Column(name = "away_score")
    private Integer awayScore;

    @Column(name = "round_number")
    private Integer roundNumber;

    @Column(name = "next_match_id")
    private Integer nextMatchId;
}
