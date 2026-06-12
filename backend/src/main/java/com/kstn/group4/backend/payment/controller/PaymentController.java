package com.kstn.group4.backend.payment.controller;

import com.kstn.group4.backend.config.security.services.UserPrincipal;
import com.kstn.group4.backend.payment.dto.CreatePaymentRequest;
import com.kstn.group4.backend.payment.dto.CreatePaymentResponse;
import com.kstn.group4.backend.payment.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/payment/vnpay")
public class PaymentController {

    private final VNPayService vnPayService;

    /**
     * POST /payment/vnpay/create-url
     * Accepts: { bookingId: number, amount: number }
     * Returns: { paymentUrl: "https://sandbox.vnpayment.vn/..." }
     *
     * Requires authenticated player (covered by anyRequest().authenticated() in security config).
     */
    @PostMapping("/create-url")
    public ResponseEntity<CreatePaymentResponse> createPaymentUrl(
            @RequestBody CreatePaymentRequest request,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpRequest
    ) {
        log.info("Creating VNPay URL for bookingId={}, pointsToUse={}", request.bookingId(), request.pointsToUse());
        return ResponseEntity.ok(vnPayService.buildPaymentUrl(request, httpRequest, principal.getId()));
    }

    /**
     * GET /payment/vnpay/ipn
     * VNPay server-to-server callback to confirm payment status.
     * Must be public (no auth token).
     */
    @GetMapping("/ipn")
    public ResponseEntity<Map<String, String>> handleIpn(@RequestParam Map<String, String> params) {
        log.info("VNPay IPN received: {}", params);
        boolean valid = vnPayService.verifySignature(params);
        if (!valid) {
            log.warn("VNPay IPN signature invalid!");
            return ResponseEntity.ok(Map.of("RspCode", "97", "Message", "Invalid signature"));
        }
        String responseCode = params.get("vnp_ResponseCode");
        String txnRef = params.get("vnp_TxnRef");
        log.info("VNPay IPN OK: txnRef={}, responseCode={}", txnRef, responseCode);
        if ("00".equals(responseCode)) {
            boolean settled = vnPayService.settleSuccessfulPayment(txnRef, params.get("vnp_Amount"));
            if (!settled) {
                return ResponseEntity.ok(Map.of("RspCode", "99", "Message", "Cannot settle membership points"));
            }
        }
        return ResponseEntity.ok(Map.of("RspCode", "00", "Message", "Confirm Success"));
    }

    @PostMapping("/confirm-return")
    public ResponseEntity<Map<String, String>> confirmReturn(@RequestBody Map<String, String> params) {
        boolean valid = vnPayService.verifySignature(params);
        if (!valid) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid signature"));
        }

        if (!"00".equals(params.get("vnp_ResponseCode"))) {
            return ResponseEntity.ok(Map.of("message", "Payment was not successful"));
        }

        boolean settled = vnPayService.settleSuccessfulPayment(params.get("vnp_TxnRef"), params.get("vnp_Amount"));
        if (!settled) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot settle membership points"));
        }

        return ResponseEntity.ok(Map.of("message", "Payment confirmed"));
    }
}
