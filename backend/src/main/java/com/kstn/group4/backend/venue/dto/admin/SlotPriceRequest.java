package com.kstn.group4.backend.venue.dto.admin;

import java.math.BigDecimal;

public record SlotPriceRequest(
        Integer slotNumber,
        BigDecimal weekdayPrice,
        BigDecimal weekendPrice
) {
}
