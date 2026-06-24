package com.kstn.group4.backend.activitylog.controller;

import com.kstn.group4.backend.activitylog.entity.ActivityLog;
import com.kstn.group4.backend.activitylog.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/activity-logs")
@PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
public class ActivityLogAdminController {

    private final ActivityLogService activityLogService;

    @GetMapping
    public ResponseEntity<Page<ActivityLog>> getActivityLogs(
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return ResponseEntity.ok(activityLogService.getLogs(pageable));
    }
}
