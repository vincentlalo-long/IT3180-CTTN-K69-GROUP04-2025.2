package com.kstn.group4.backend.dto.manager;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    private Double totalRevenue;
    private Integer totalBookings;
    private Integer uniqueCustomers;
    private String vacancyRate;
    private Integer activeFields;
}