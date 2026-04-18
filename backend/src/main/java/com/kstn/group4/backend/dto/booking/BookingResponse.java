package com.kstn.group4.backend.dto.booking;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import lombok.Builder;

@Builder
public record BookingResponse(
        Integer id,
        Integer pitchId,
        String pitchName,
        LocalDate bookingDate,
        LocalTime startTime,
        LocalTime endTime,
        String status,
        String bookingType,
        BigDecimal totalPrice,
        LocalDateTime createdAt
) {
}
