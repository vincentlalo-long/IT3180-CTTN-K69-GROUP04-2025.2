package com.kstn.group4.backend.venue.dto.player;

import java.math.BigDecimal;

public record VenueResponseDTO(
        Integer id,
        String name,
        String address,
        String imageUrl,
        BigDecimal minPrice
) {
}
