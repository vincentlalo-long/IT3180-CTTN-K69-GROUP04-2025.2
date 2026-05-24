package com.kstn.group4.backend.booking.dto.admin;

import java.math.BigDecimal;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleSlotDto {
    private Long timeSlotId;
    private LocalTime startTime;
    private LocalTime endTime;
    private String status;
    private String customerName;
    private String customerPhone;
    private BigDecimal depositAmount;
}
