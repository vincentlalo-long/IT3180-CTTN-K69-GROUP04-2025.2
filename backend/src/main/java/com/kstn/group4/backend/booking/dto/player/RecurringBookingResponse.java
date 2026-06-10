package com.kstn.group4.backend.booking.dto.player;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record RecurringBookingResponse(
        Integer requestedCount,
        Integer createdCount,
        Integer skippedCount,
        BigDecimal totalPrice,
        BigDecimal totalDepositAmount,
        List<PlayerBookingResponse> bookings,
        List<SkippedOccurrence> skippedOccurrences,
        String message
) {
    public record SkippedOccurrence(
            LocalDate bookingDate,
            Integer pitchId,
            Integer timeSlotId,
            String reasonCode,
            String reason
    ) {
    }
}
