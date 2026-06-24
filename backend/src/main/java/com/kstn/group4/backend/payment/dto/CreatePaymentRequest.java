package com.kstn.group4.backend.payment.dto;

import java.math.BigDecimal;

public record CreatePaymentRequest(
        String bookingId,
        BigDecimal amount,
        Integer pointsToUse
) {
}
