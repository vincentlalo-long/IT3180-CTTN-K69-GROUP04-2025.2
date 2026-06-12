package com.kstn.group4.backend.team.controller;

import com.kstn.group4.backend.config.security.services.UserPrincipal;
import com.kstn.group4.backend.team.dto.CreateTeamRequest;
import com.kstn.group4.backend.team.dto.TeamResponse;
import com.kstn.group4.backend.team.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/teams")
public class TeamController {

    private final TeamService teamService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('PLAYER', 'ROLE_PLAYER', 'ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<TeamResponse> createTeam(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateTeamRequest request
    ) {
        TeamResponse response = teamService.createTeam(userPrincipal, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my-team")
    @PreAuthorize("hasAnyAuthority('PLAYER', 'ROLE_PLAYER', 'ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<TeamResponse> getMyTeam(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        TeamResponse response = teamService.getMyTeam(userPrincipal);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('PLAYER', 'ROLE_PLAYER', 'ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<TeamResponse> getTeamDetails(@PathVariable Long id) {
        TeamResponse response = teamService.getTeamDetailsById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('PLAYER', 'ROLE_PLAYER', 'ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<List<TeamResponse>> getApprovedTeams() {
        return ResponseEntity.ok(teamService.getApprovedTeams());
    }

    // ==================== CÁC API BỔ SUNG MỚI (DÀNH CHO ĐỘI TRƯỞNG) ====================

    /**
     * API: Mời người chơi khác tham gia qua Email
     * POST /teams/{teamId}/invite?email=abc@gmail.com
     */
    @PostMapping("/{teamId}/invite")
    @PreAuthorize("hasAnyAuthority('PLAYER', 'ROLE_PLAYER', 'ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<String> inviteMember(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long teamId,
            @RequestParam String email
    ) {
        teamService.inviteMember(userPrincipal, teamId, email);
        return ResponseEntity.ok("Đã gửi lời mời tham gia đội bóng!");
    }

    /**
     * API: Phê duyệt thành viên vào đội
     * PUT /teams/{teamId}/members/approve?email=abc@gmail.com
     */
    @PutMapping("/{teamId}/members/approve")
    @PreAuthorize("hasAnyAuthority('PLAYER', 'ROLE_PLAYER', 'ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<String> approveMember(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long teamId,
            @RequestParam String email
    ) {
        teamService.approveMember(userPrincipal, teamId, email);
        return ResponseEntity.ok("Đã duyệt thành viên vào đội bóng!");
    }

    /**
     * API: Kick thành viên ra khỏi đội bóng
     * DELETE /teams/{teamId}/members?email=abc@gmail.com
     */
    @DeleteMapping("/{teamId}/members")
    @PreAuthorize("hasAnyAuthority('PLAYER', 'ROLE_PLAYER', 'ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<String> kickMember(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long teamId,
            @RequestParam String email
    ) {
        teamService.kickMember(userPrincipal, teamId, email);
        return ResponseEntity.ok("Đã xóa thành viên ra khỏi đội bóng!");
    }

    /**
     * API: Thành viên tự rời khỏi đội bóng
     * DELETE /teams/{teamId}/members/me
     */
    @DeleteMapping("/{teamId}/members/me")
    @PreAuthorize("hasAnyAuthority('PLAYER', 'ROLE_PLAYER', 'ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<String> leaveTeam(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long teamId
    ) {
        teamService.leaveTeam(userPrincipal, teamId);
        return ResponseEntity.ok("Đã rời khỏi đội bóng!");
    }
}
