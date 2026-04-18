package com.kstn.group4.backend.dto.pitch;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ManagerCreatePitchRequest(
        @NotBlank String name,
        @NotBlank String address,
        @NotBlank String pitchType,
        @NotBlank String surfaceType,
        @NotNull @DecimalMin("0.0") BigDecimal basePrice,
        String imageUrl
) {
}
