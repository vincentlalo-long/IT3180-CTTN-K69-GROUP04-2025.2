package com.kstn.group4.backend.league.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LeagueAnnouncementCommentRequest {

    @NotBlank(message = "Nội dung bình luận không được để trống")
    private String content;
}
