package com.kstn.group4.backend.payment.dto;

import java.math.BigDecimal;

public record CreatePaymentResponse(
        String paymentUrl,
        BigDecimal payableAmount,
        BigDecimal discountAmount,
        Integer pointsUsed
) {
}
