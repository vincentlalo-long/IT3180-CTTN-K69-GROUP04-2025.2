package com.kstn.group4.backend.venue.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ServiceItemRequest(
        @NotBlank(message = "name khong duoc de trong")
        String name,

        String description,

        @NotNull(message = "price khong duoc de trong")
        @DecimalMin(value = "0.0", inclusive = false, message = "price phai lon hon 0")
        BigDecimal price,

        @NotBlank(message = "unit khong duoc de trong")
        String unit,

        String status
) {
}
