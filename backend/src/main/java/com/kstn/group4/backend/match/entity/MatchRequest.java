package com.kstn.group4.backend.match.entity;

import com.kstn.group4.backend.match.enums.MatchRequestStatus;
import com.kstn.group4.backend.team.entity.Team;
import com.kstn.group4.backend.user.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "match_requests")
public class MatchRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_team_id", nullable = false)
    private Team guestTeam;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdByUser;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MatchRequestStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public MatchRequest() {
        this.createdAt = LocalDateTime.now();
    }
}
