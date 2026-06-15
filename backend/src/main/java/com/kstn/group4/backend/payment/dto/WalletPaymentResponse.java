package com.kstn.group4.backend.payment.dto;

import java.math.BigDecimal;
import java.util.List;

public record WalletPaymentResponse(
        List<Integer> bookingIds,
        BigDecimal payableAmount,
        BigDecimal discountAmount,
        Integer pointsUsed,
        BigDecimal walletBalance
) {
}
