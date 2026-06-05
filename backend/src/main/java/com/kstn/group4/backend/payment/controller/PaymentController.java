package com.kstn.group4.backend.payment.controller;

import com.kstn.group4.backend.payment.dto.CreatePaymentRequest;
import com.kstn.group4.backend.payment.dto.CreatePaymentResponse;
import com.kstn.group4.backend.payment.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
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
            HttpServletRequest httpRequest
    ) {
        log.info("Creating VNPay URL for bookingId={}, amount={}", request.bookingId(), request.amount());
        String url = vnPayService.buildPaymentUrl(request, httpRequest);
        return ResponseEntity.ok(new CreatePaymentResponse(url));
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
        return ResponseEntity.ok(Map.of("RspCode", "00", "Message", "Confirm Success"));
    }
}
