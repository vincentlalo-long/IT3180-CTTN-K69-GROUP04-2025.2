package com.kstn.group4.backend.statistics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private BigDecimal totalRevenue;
    private Long totalBookings;
    private Long canceledBookings;
    private Long uniqueCustomers;
    private Double occupancyRate;
    private List<PitchPerformanceDto> pitchPerformances;
}
