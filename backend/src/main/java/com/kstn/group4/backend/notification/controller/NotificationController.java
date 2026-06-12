package com.kstn.group4.backend.notification.controller;

import com.kstn.group4.backend.config.security.services.UserPrincipal;
import com.kstn.group4.backend.notification.dto.NotificationResponse;
import com.kstn.group4.backend.notification.dto.NotificationUnreadCountResponse;
import com.kstn.group4.backend.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/notifications")
@PreAuthorize("hasAnyAuthority('PLAYER', 'ROLE_PLAYER', 'ADMIN', 'ROLE_ADMIN')")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<Page<NotificationResponse>> getMyNotifications(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return ResponseEntity.ok(notificationService.getMyNotifications(principal.getId(), pageable));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<NotificationUnreadCountResponse> getUnreadCount(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(new NotificationUnreadCountResponse(
                notificationService.countUnread(principal.getId())
        ));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(notificationService.markAsRead(id, principal.getId()));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal UserPrincipal principal) {
        notificationService.markAllAsRead(principal.getId());
        return ResponseEntity.noContent().build();
    }
}
