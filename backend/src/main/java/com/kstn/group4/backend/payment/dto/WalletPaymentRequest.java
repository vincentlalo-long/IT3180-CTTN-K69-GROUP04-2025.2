package com.kstn.group4.backend.payment.dto;

public record WalletPaymentRequest(
        String bookingId,
        Integer pointsToUse
) {
}
