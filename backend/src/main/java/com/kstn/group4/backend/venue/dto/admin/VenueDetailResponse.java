package com.kstn.group4.backend.venue.dto.admin;

import com.kstn.group4.backend.venue.entity.PitchType;
import java.time.LocalTime;
import java.util.List;

public record VenueDetailResponse(
        Integer id,
        String name,
        String address,
        String description,
        Integer managerId,
        LocalTime openTime,
        LocalTime closeTime,
        Double latitude,
        Double longitude,
        List<PitchSummaryResponse> pitches
) {
    public record PitchSummaryResponse(
            Integer id,
            String name,
            PitchType pitchType,
            Boolean isActive
    ) {
    }
}
