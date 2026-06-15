package com.kstn.group4.backend.wallet.controller;

import com.kstn.group4.backend.config.security.services.UserPrincipal;
import com.kstn.group4.backend.wallet.dto.TopUpWalletRequest;
import com.kstn.group4.backend.wallet.dto.WalletBalanceResponse;
import com.kstn.group4.backend.wallet.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/wallet")
@PreAuthorize("hasAnyAuthority('PLAYER', 'ROLE_PLAYER', 'ADMIN', 'ROLE_ADMIN')")
public class WalletController {

    private final WalletService walletService;

    @PostMapping("/top-up")
    public ResponseEntity<WalletBalanceResponse> topUp(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TopUpWalletRequest request
    ) {
        return ResponseEntity.ok(walletService.topUp(principal.getId(), request));
    }
}
