package com.kstn.group4.backend.statistics.controller;

import com.kstn.group4.backend.statistics.dto.DashboardStatsResponse;
import com.kstn.group4.backend.statistics.dto.RecentOrderDto;
import com.kstn.group4.backend.statistics.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/dashboard")
@PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats(
            @RequestParam(name = "facilityId", defaultValue = "ALL") String facilityId,
            @RequestParam(name = "timeRange", defaultValue = "TODAY") String timeRange,
            @RequestParam(name = "startDate", required = false) String startDate,
            @RequestParam(name = "endDate", required = false) String endDate
    ) {
        return ResponseEntity.ok(adminDashboardService.getDashboardStats(facilityId, timeRange, startDate, endDate));
    }

    @GetMapping("/recent-orders")
    public ResponseEntity<List<RecentOrderDto>> getRecentOrders(
            @RequestParam(name = "facilityId", defaultValue = "ALL") String facilityId,
            @RequestParam(name = "timeRange", defaultValue = "TODAY") String timeRange,
            @RequestParam(name = "startDate", required = false) String startDate,
            @RequestParam(name = "endDate", required = false) String endDate
    ) {
        return ResponseEntity.ok(adminDashboardService.getRecentOrders(facilityId, timeRange, startDate, endDate));
    }
}
