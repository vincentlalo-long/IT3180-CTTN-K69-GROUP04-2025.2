package com.kstn.group4.backend.dto.pitch;

import java.math.BigDecimal;
import lombok.Builder;

@Builder
public record AddonServiceResponse(
        Integer id,
        String name,
        BigDecimal price,
        String unit
) {
}
