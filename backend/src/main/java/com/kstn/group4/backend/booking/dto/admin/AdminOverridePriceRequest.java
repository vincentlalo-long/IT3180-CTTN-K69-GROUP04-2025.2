package com.kstn.group4.backend.booking.dto.admin;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public record AdminOverridePriceRequest(
        @NotNull(message = "New price cannot be null")
        @PositiveOrZero(message = "New price must be zero or positive")
        BigDecimal newPrice
) {
}