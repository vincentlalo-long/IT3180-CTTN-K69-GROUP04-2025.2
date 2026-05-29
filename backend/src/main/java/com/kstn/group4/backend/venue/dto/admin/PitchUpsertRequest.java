package com.kstn.group4.backend.venue.dto.admin;

import java.util.List;

public record PitchUpsertRequest(
        String name,
        String pitchType,
        Boolean isActive,
        List<SlotPriceRequest> slotPrices
) {
}
