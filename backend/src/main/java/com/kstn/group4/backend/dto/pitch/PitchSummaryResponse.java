package com.kstn.group4.backend.dto.pitch;

import java.math.BigDecimal;
import lombok.Builder;

@Builder
public record PitchSummaryResponse(
        Integer id,
        String name,
        String address,
        String pitchType,
        String surfaceType,
        BigDecimal basePrice,
        String imageUrl
) {
}
