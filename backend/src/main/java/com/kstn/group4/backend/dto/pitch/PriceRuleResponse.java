package com.kstn.group4.backend.dto.pitch;

import java.math.BigDecimal;
import java.time.LocalTime;
import lombok.Builder;

@Builder
public record PriceRuleResponse(
        Integer id,
        String dayOfWeek,
        LocalTime startTime,
        LocalTime endTime,
        BigDecimal price
) {
}
