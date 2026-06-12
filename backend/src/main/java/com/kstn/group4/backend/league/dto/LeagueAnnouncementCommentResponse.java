package com.kstn.group4.backend.league.dto;

import com.kstn.group4.backend.league.entity.LeagueAnnouncementComment;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class LeagueAnnouncementCommentResponse {
    private Integer id;
    private Integer announcementId;
    private Integer userId;
    private String username;
    private String userAvatarUrl;
    private String content;
    private LocalDateTime createdAt;

    public static LeagueAnnouncementCommentResponse fromEntity(LeagueAnnouncementComment comment) {
        LeagueAnnouncementCommentResponse response = new LeagueAnnouncementCommentResponse();
        response.setId(comment.getId());
        if (comment.getAnnouncement() != null) {
            response.setAnnouncementId(comment.getAnnouncement().getId());
        }
        if (comment.getUser() != null) {
            response.setUserId(comment.getUser().getId());
            response.setUsername(comment.getUser().getUsername());
            response.setUserAvatarUrl(comment.getUser().getAvatarUrl());
        }
        response.setContent(comment.getContent());
        response.setCreatedAt(comment.getCreatedAt());
        return response;
    }
}
