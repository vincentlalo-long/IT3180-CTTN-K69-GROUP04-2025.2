package com.kstn.group4.backend.dto.pitch;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import lombok.Builder;

@Builder
public record AvailabilityResponse(
        Integer pitchId,
        LocalDate date,
        List<TimeSlotResponse> availableSlots,
        List<TimeSlotResponse> bookedSlots
) {

    @Builder
    public record TimeSlotResponse(
            LocalTime startTime,
            LocalTime endTime
    ) {
    }
}
