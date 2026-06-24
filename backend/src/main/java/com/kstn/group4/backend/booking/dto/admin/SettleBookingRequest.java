package com.kstn.group4.backend.booking.dto.admin;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record SettleBookingRequest(
        List<ServiceItem> services,

        @NotBlank(message = "Phương thức thanh toán không được để trống")
        String paymentMethod,

        String adminNote
) {
    public record ServiceItem(
            Integer serviceId,
            Integer quantity
    ) {}
}
