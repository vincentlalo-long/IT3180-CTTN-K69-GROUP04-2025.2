package com.kstn.group4.backend.wallet.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record TopUpWalletRequest(
        @NotNull(message = "Amount is required")
        @DecimalMin(value = "1000.00", message = "Amount must be at least 1000")
        BigDecimal amount
) {
}
