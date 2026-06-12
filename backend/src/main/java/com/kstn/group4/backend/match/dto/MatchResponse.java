package com.kstn.group4.backend.match.dto;

import com.kstn.group4.backend.match.enums.MatchSkillLevel;
import com.kstn.group4.backend.match.enums.MatchStatus;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MatchResponse {
    private Integer id;
    private Integer venueId;
    private String venueName;
    private Long hostTeamId;
    private String hostTeamName;
    private Long guestTeamId;
    private String guestTeamName;
    private MatchSkillLevel skillLevel;
    private LocalDateTime matchTime;
    private MatchStatus status;
    private String description;
    private Integer pitchType;
    private Integer homeScore;
    private Integer awayScore;
    private Integer roundNumber;
    private Integer nextMatchId;
    private Boolean recommended;
}
