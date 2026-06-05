package com.kstn.group4.backend.league.dto;

import com.kstn.group4.backend.league.enums.LeagueFormat;
import com.kstn.group4.backend.league.enums.LeagueStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LeagueRequest {
    @NotBlank(message = "Tên giải đấu không được để trống")
    private String name;
    
    @NotNull(message = "Thể thức không được để trống")
    private LeagueFormat format;
    
    @NotNull(message = "Số đội không được để trống")
    @Min(value = 2, message = "Số đội phải lớn hơn hoặc bằng 2")
    private Integer numberOfTeams;
    
    private String prize;
    
    @NotNull(message = "Trạng thái không được để trống")
    private LeagueStatus status;
}
