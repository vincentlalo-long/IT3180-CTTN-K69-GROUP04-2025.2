package com.kstn.group4.backend.wallet;

import com.kstn.group4.backend.exception.BusinessException;
import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.user.entity.User;
import com.kstn.group4.backend.user.repository.UserRepository;
import com.kstn.group4.backend.wallet.dto.TopUpWalletRequest;
import com.kstn.group4.backend.wallet.dto.WalletBalanceResponse;
import com.kstn.group4.backend.wallet.service.WalletService;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WalletServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private WalletService walletService;

    // --- topUp tests ---

    @Test
    void topUp_withValidAmount_updatesBalance() {
        Integer userId = 1;
        TopUpWalletRequest request = new TopUpWalletRequest(BigDecimal.valueOf(5000));
        User user = createUser(userId, BigDecimal.valueOf(10000));

        when(userRepository.findByIdForUpdate(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        WalletBalanceResponse response = walletService.topUp(userId, request);

        assertNotNull(response);
        assertEquals(0, BigDecimal.valueOf(15000).compareTo(response.walletBalance()));
        verify(userRepository).save(user);
    }

    @Test
    void topUp_withExactMinimumAmount_succeeds() {
        Integer userId = 1;
        TopUpWalletRequest request = new TopUpWalletRequest(BigDecimal.valueOf(1000));
        User user = createUser(userId, BigDecimal.ZERO);

        when(userRepository.findByIdForUpdate(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        WalletBalanceResponse response = walletService.topUp(userId, request);

        assertNotNull(response);
        assertEquals(0, BigDecimal.valueOf(1000).compareTo(response.walletBalance()));
    }

    @Test
    void topUp_withAmountBelowMinimum_throwsBusinessException() {
        TopUpWalletRequest request = new TopUpWalletRequest(BigDecimal.valueOf(999));

        assertThrows(BusinessException.class, () -> walletService.topUp(1, request));
        verify(userRepository, never()).findByIdForUpdate(any());
    }

    @Test
    void topUp_withZeroAmount_throwsBusinessException() {
        TopUpWalletRequest request = new TopUpWalletRequest(BigDecimal.ZERO);

        assertThrows(BusinessException.class, () -> walletService.topUp(1, request));
    }

    @Test
    void topUp_withNullAmount_throwsBusinessException() {
        TopUpWalletRequest request = new TopUpWalletRequest(null);

        assertThrows(BusinessException.class, () -> walletService.topUp(1, request));
    }

    @Test
    void topUp_withNonExistentUser_throwsResourceNotFoundException() {
        TopUpWalletRequest request = new TopUpWalletRequest(BigDecimal.valueOf(5000));
        when(userRepository.findByIdForUpdate(999)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> walletService.topUp(999, request));
    }

    @Test
    void topUp_withNegativeAmount_throwsBusinessException() {
        TopUpWalletRequest request = new TopUpWalletRequest(BigDecimal.valueOf(-5000));

        assertThrows(BusinessException.class, () -> walletService.topUp(1, request));
    }

    // --- debit tests ---

    @Test
    void debit_withValidAmount_deductsBalance() {
        Integer userId = 1;
        BigDecimal amount = BigDecimal.valueOf(3000);
        User user = createUser(userId, BigDecimal.valueOf(10000));

        when(userRepository.findByIdForUpdate(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User result = walletService.debit(userId, amount);

        assertNotNull(result);
        assertEquals(0, BigDecimal.valueOf(7000).compareTo(result.getWalletBalance()));
        verify(userRepository).save(user);
    }

    @Test
    void debit_withExactBalance_succeeds() {
        Integer userId = 1;
        BigDecimal amount = BigDecimal.valueOf(10000);
        User user = createUser(userId, BigDecimal.valueOf(10000));

        when(userRepository.findByIdForUpdate(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User result = walletService.debit(userId, amount);

        assertEquals(0, BigDecimal.ZERO.compareTo(result.getWalletBalance()));
    }

    @Test
    void debit_withInsufficientBalance_throwsBusinessException() {
        Integer userId = 1;
        BigDecimal amount = BigDecimal.valueOf(20000);
        User user = createUser(userId, BigDecimal.valueOf(10000));

        when(userRepository.findByIdForUpdate(userId)).thenReturn(Optional.of(user));

        BusinessException ex = assertThrows(BusinessException.class, () -> walletService.debit(userId, amount));
        assertEquals("INSUFFICIENT_WALLET_BALANCE", ex.getErrorCode());
        verify(userRepository, never()).save(any());
    }

    @Test
    void debit_withNullAmount_throwsBusinessException() {
        assertThrows(BusinessException.class, () -> walletService.debit(1, null));
    }

    @Test
    void debit_withZeroAmount_throwsBusinessException() {
        assertThrows(BusinessException.class, () -> walletService.debit(1, BigDecimal.ZERO));
    }

    @Test
    void debit_withNegativeAmount_throwsBusinessException() {
        assertThrows(BusinessException.class, () -> walletService.debit(1, BigDecimal.valueOf(-100)));
    }

    @Test
    void debit_withNonExistentUser_throwsResourceNotFoundException() {
        when(userRepository.findByIdForUpdate(999)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> walletService.debit(999, BigDecimal.valueOf(1000)));
    }

    @Test
    void debit_withNullWalletBalance_treatsAsZero() {
        Integer userId = 1;
        User user = createUser(userId, null);

        when(userRepository.findByIdForUpdate(userId)).thenReturn(Optional.of(user));

        assertThrows(BusinessException.class, () -> walletService.debit(userId, BigDecimal.valueOf(1000)));
    }

    private User createUser(Integer id, BigDecimal walletBalance) {
        User user = new User();
        user.setId(id);
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setRole("PLAYER");
        user.setWalletBalance(walletBalance);
        return user;
    }
}
