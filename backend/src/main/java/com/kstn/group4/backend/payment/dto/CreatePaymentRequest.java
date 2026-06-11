package com.kstn.group4.backend.payment.dto;

import java.math.BigDecimal;

public record CreatePaymentRequest(
        Integer bookingId,
        BigDecimal amount,
        Integer pointsToUse
) {
}
