package com.kstn.group4.backend.venue.dto.player;

import java.math.BigDecimal;
import java.time.LocalTime;

public record SlotStatus(
        Integer timeSlotId,
        Integer slotNumber,
        LocalTime startTime,
        LocalTime endTime,
        BigDecimal price,
        String status
) {
}