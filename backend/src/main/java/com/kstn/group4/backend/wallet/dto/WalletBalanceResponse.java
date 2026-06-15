package com.kstn.group4.backend.wallet.dto;

import java.math.BigDecimal;

public record WalletBalanceResponse(
        BigDecimal walletBalance
) {
}
