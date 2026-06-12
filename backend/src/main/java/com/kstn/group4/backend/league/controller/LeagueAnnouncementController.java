package com.kstn.group4.backend.league.controller;

import com.kstn.group4.backend.config.security.services.UserPrincipal;
import com.kstn.group4.backend.league.dto.*;
import com.kstn.group4.backend.league.service.LeagueAnnouncementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
public class LeagueAnnouncementController {

    private final LeagueAnnouncementService announcementService;

    public LeagueAnnouncementController(LeagueAnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    // --- ADMIN / MANAGER ENDPOINTS ---

    @PostMapping("/admin/leagues/{leagueId}/announcements")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LeagueAnnouncementResponse> createAnnouncement(
            @PathVariable Integer leagueId,
            @Valid @RequestBody LeagueAnnouncementRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        LeagueAnnouncementResponse response = announcementService.createAnnouncement(leagueId, request, userPrincipal.getId());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/admin/leagues/announcements/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LeagueAnnouncementResponse> updateAnnouncement(
            @PathVariable Integer id,
            @Valid @RequestBody LeagueAnnouncementRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        LeagueAnnouncementResponse response = announcementService.updateAnnouncement(id, request, userPrincipal.getId());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/admin/leagues/announcements/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAnnouncement(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        announcementService.deleteAnnouncement(id, userPrincipal.getId());
        return ResponseEntity.noContent().build();
    }

    // --- PUBLIC / GENERAL ENDPOINTS ---

    @GetMapping("/leagues/{leagueId}/announcements")
    public ResponseEntity<List<LeagueAnnouncementResponse>> getAnnouncementsByLeagueId(@PathVariable Integer leagueId) {
        List<LeagueAnnouncementResponse> response = announcementService.getAnnouncementsByLeagueId(leagueId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/leagues/announcements/{id}")
    public ResponseEntity<LeagueAnnouncementResponse> getAnnouncementById(@PathVariable Integer id) {
        LeagueAnnouncementResponse response = announcementService.getAnnouncementById(id);
        return ResponseEntity.ok(response);
    }

    // --- COMMENT ENDPOINTS ---

    @PostMapping("/leagues/announcements/{announcementId}/comments")
    public ResponseEntity<LeagueAnnouncementCommentResponse> addComment(
            @PathVariable Integer announcementId,
            @Valid @RequestBody LeagueAnnouncementCommentRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        LeagueAnnouncementCommentResponse response = announcementService.addComment(announcementId, request, userPrincipal.getId());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/leagues/announcements/{announcementId}/comments")
    public ResponseEntity<List<LeagueAnnouncementCommentResponse>> getCommentsByAnnouncementId(@PathVariable Integer announcementId) {
        List<LeagueAnnouncementCommentResponse> response = announcementService.getCommentsByAnnouncementId(announcementId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/leagues/announcements/comments/{id}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        announcementService.deleteComment(id, userPrincipal.getId());
        return ResponseEntity.noContent().build();
    }
}
