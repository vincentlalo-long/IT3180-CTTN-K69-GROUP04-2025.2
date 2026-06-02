package com.kstn.group4.backend.match.dto;

import com.kstn.group4.backend.match.enums.MatchRequestStatus;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MatchRequestResponse {
    private Integer id;
    private Integer matchId;
    private Long guestTeamId;
    private String guestTeamName;
    private String createdByUsername;
    private MatchRequestStatus status;
    private LocalDateTime createdAt;
}
