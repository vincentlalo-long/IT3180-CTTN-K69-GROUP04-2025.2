package com.kstn.group4.backend.statistics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentOrderDto {
    private String id;
    private String customerName;
    private String fieldName;
    private String bookingTime;
    private BigDecimal price;
    private String status;
}
