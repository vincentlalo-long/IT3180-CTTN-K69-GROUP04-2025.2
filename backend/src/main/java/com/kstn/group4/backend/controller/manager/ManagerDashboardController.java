package com.kstn.group4.backend.controller.manager;

import com.kstn.group4.backend.dto.manager.DashboardStatsResponse;
import com.kstn.group4.backend.dto.manager.RecentOrderDto;
import com.kstn.group4.backend.service.manager.ManagerDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/managers/dashboard")
public class ManagerDashboardController {

    private final ManagerDashboardService managerDashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats(
            @RequestParam(name = "facilityId", required = false) String facilityId
    ) {
        Long currentManagerId = 2L;
        return ResponseEntity.ok(managerDashboardService.getDashboardStats(facilityId, currentManagerId));
    }

    @GetMapping("/recent-orders")
    public ResponseEntity<List<RecentOrderDto>> getRecentOrders(
            @RequestParam(name = "facilityId", required = false) String facilityId
    ) {
        Long currentManagerId = 2L;
        return ResponseEntity.ok(managerDashboardService.getRecentOrders(facilityId, currentManagerId));
    }
}

