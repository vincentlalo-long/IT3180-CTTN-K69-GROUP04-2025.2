package com.kstn.group4.backend.match.dto;

import com.kstn.group4.backend.match.enums.MatchSkillLevel;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateMatchRequest {

    @NotNull(message = "ID khu sân không được để trống")
    private Integer venueId;

    @NotNull(message = "Trình độ yêu cầu không được để trống")
    private MatchSkillLevel skillLevel;

    @NotNull(message = "Thời gian thi đấu không được để trống")
    private LocalDateTime matchTime;
}
