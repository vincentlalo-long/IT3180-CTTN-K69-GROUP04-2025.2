package com.kstn.group4.backend.league.dto;

import com.kstn.group4.backend.league.enums.LeagueFormat;
import com.kstn.group4.backend.league.enums.LeagueStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.Data;

@Data
public class LeagueRequest {
    @NotBlank(message = "Ten giai dau khong duoc de trong")
    private String name;

    private String description;

    @NotNull(message = "The thuc khong duoc de trong")
    private LeagueFormat format;

    @NotNull(message = "So doi khong duoc de trong")
    @Min(value = 2, message = "So doi phai lon hon hoac bang 2")
    private Integer numberOfTeams;

    private String prize;

    private LocalDate startDate;

    private LocalDate endDate;

    private Integer venueId;

    private Integer timeSlotId;

    @NotNull(message = "Trang thai khong duoc de trong")
    private LeagueStatus status;
}
