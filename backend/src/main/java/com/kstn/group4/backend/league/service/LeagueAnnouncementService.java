package com.kstn.group4.backend.league.service;

import com.kstn.group4.backend.league.dto.*;
import java.util.List;

public interface LeagueAnnouncementService {
    LeagueAnnouncementResponse createAnnouncement(Integer leagueId, LeagueAnnouncementRequest request, Integer managerId);
    
    LeagueAnnouncementResponse updateAnnouncement(Integer announcementId, LeagueAnnouncementRequest request, Integer managerId);
    
    void deleteAnnouncement(Integer announcementId, Integer managerId);
    
    LeagueAnnouncementResponse getAnnouncementById(Integer announcementId);
    
    List<LeagueAnnouncementResponse> getAnnouncementsByLeagueId(Integer leagueId);
    
    LeagueAnnouncementCommentResponse addComment(Integer announcementId, LeagueAnnouncementCommentRequest request, Integer userId);
    
    List<LeagueAnnouncementCommentResponse> getCommentsByAnnouncementId(Integer announcementId);
    
    void deleteComment(Integer commentId, Integer userId);
}
