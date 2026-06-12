package com.kstn.group4.backend.league.dto;

import com.kstn.group4.backend.league.entity.LeagueAnnouncement;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class LeagueAnnouncementResponse {
    private Integer id;
    private Integer leagueId;
    private String title;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static LeagueAnnouncementResponse fromEntity(LeagueAnnouncement announcement) {
        LeagueAnnouncementResponse response = new LeagueAnnouncementResponse();
        response.setId(announcement.getId());
        if (announcement.getLeague() != null) {
            response.setLeagueId(announcement.getLeague().getId());
        }
        response.setTitle(announcement.getTitle());
        response.setContent(announcement.getContent());
        response.setCreatedAt(announcement.getCreatedAt());
        response.setUpdatedAt(announcement.getUpdatedAt());
        return response;
    }
}
