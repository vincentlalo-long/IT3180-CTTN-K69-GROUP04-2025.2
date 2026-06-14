package com.kstn.group4.backend.match.dto;

import com.kstn.group4.backend.match.enums.MatchSkillLevel;
import com.kstn.group4.backend.match.enums.MatchStatus;
import java.time.LocalDateTime;
import java.math.BigDecimal;
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
    private Integer bookingId;
    private BigDecimal price;

    public MatchResponse(
            Integer id,
            Integer venueId,
            String venueName,
            Long hostTeamId,
            String hostTeamName,
            Long guestTeamId,
            String guestTeamName,
            MatchSkillLevel skillLevel,
            LocalDateTime matchTime,
            MatchStatus status,
            String description,
            Integer pitchType,
            Integer homeScore,
            Integer awayScore,
            Integer roundNumber,
            Integer nextMatchId,
            Boolean recommended
    ) {
        this.id = id;
        this.venueId = venueId;
        this.venueName = venueName;
        this.hostTeamId = hostTeamId;
        this.hostTeamName = hostTeamName;
        this.guestTeamId = guestTeamId;
        this.guestTeamName = guestTeamName;
        this.skillLevel = skillLevel;
        this.matchTime = matchTime;
        this.status = status;
        this.description = description;
        this.pitchType = pitchType;
        this.homeScore = homeScore;
        this.awayScore = awayScore;
        this.roundNumber = roundNumber;
        this.nextMatchId = nextMatchId;
        this.recommended = recommended;
        this.bookingId = null;
        this.price = null;
    }
}

