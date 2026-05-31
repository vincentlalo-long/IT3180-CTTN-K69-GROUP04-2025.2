package com.kstn.group4.backend.match.dto;

import com.kstn.group4.backend.match.enums.MatchSkillLevel;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateMatchRequest {

    @NotNull(message = "ID khu sân không được để trống")
    private Integer venueId;

    @NotNull(message = "Trình độ yêu cầu không được để trống")
    private MatchSkillLevel skillLevel;

    @NotNull(message = "ID khung giờ không được để trống")
    private Integer timeSlotId;

    @NotNull(message = "Ngày thi đấu không được để trống")
    private LocalDate matchDate;

    private String description;
}
