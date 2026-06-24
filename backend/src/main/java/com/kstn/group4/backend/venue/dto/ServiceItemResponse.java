package com.kstn.group4.backend.venue.dto;

import java.math.BigDecimal;

public record ServiceItemResponse(
        Integer id,
        Integer venueId,
        String name,
        String description,
        BigDecimal price,
        String unit,
        String status
) {
}
