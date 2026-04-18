package com.kstn.group4.backend.dto.pitch;

import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;

public record ManagerUpdatePitchRequest(
        String name,
        String address,
        String pitchType,
        String surfaceType,
        @DecimalMin("0.0") BigDecimal basePrice,
        String imageUrl
) {
}
