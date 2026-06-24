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
public class PitchPerformanceDto {
    private Integer pitchId;
    private String pitchName;
    private Long bookingCount;
    private BigDecimal revenue;
}
