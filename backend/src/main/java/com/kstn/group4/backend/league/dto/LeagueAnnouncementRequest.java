package com.kstn.group4.backend.league.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LeagueAnnouncementRequest {

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    @NotBlank(message = "Nội dung không được để trống")
    private String content;
}
