package com.kstn.group4.backend.wallet.service;

import com.kstn.group4.backend.exception.BusinessException;
import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.user.entity.User;
import com.kstn.group4.backend.user.repository.UserRepository;
import com.kstn.group4.backend.wallet.dto.TopUpWalletRequest;
import com.kstn.group4.backend.wallet.dto.WalletBalanceResponse;
import java.math.BigDecimal;
import java.math.RoundingMode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WalletService {

    private static final BigDecimal MIN_AMOUNT = BigDecimal.valueOf(1000);

    private final UserRepository userRepository;

    @Transactional
    public WalletBalanceResponse topUp(Integer userId, TopUpWalletRequest request) {
        BigDecimal amount = normalizeTopUpAmount(request.amount());
        User user = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found", "User"));

        user.setWalletBalance(currentBalance(user).add(amount));
        userRepository.save(user);
        return new WalletBalanceResponse(user.getWalletBalance());
    }

    @Transactional
    public User debit(Integer userId, BigDecimal amount) {
        BigDecimal normalizedAmount = normalizePaymentAmount(amount);
        User user = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found", "User"));

        BigDecimal currentBalance = currentBalance(user);
        if (currentBalance.compareTo(normalizedAmount) < 0) {
            throw new BusinessException("Insufficient wallet balance", "INSUFFICIENT_WALLET_BALANCE");
        }

        user.setWalletBalance(currentBalance.subtract(normalizedAmount));
        return userRepository.save(user);
    }

    private BigDecimal currentBalance(User user) {
        return user.getWalletBalance() != null ? user.getWalletBalance() : BigDecimal.ZERO;
    }

    private BigDecimal normalizeTopUpAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(MIN_AMOUNT) < 0) {
            throw new BusinessException("Amount must be at least 1000", "INVALID_WALLET_AMOUNT");
        }
        return amount.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal normalizePaymentAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Payment amount must be greater than zero", "INVALID_WALLET_AMOUNT");
        }
        return amount.setScale(2, RoundingMode.HALF_UP);
    }
}
