package com.kstn.group4.backend.team.entity;

import com.kstn.group4.backend.user.entity.User;
import com.kstn.group4.backend.team.enums.TeamStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "teams")
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "captain_id", nullable = false)
    private User captain;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "reputation_score")
    private Integer reputationScore = 100;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TeamStatus status;

    @Column(name = "banned_until")
    private LocalDateTime bannedUntil;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Team() {
        this.createdAt = LocalDateTime.now();
        this.reputationScore = 100;
        this.status = TeamStatus.PENDING;
        this.bannedUntil = null;
    }
}
