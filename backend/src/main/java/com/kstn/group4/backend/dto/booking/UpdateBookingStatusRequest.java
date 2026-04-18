package com.kstn.group4.backend.dto.booking;

import jakarta.validation.constraints.NotBlank;

public record UpdateBookingStatusRequest(
        @NotBlank String status
) {
}
