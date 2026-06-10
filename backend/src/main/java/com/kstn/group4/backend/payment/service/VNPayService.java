package com.kstn.group4.backend.payment.service;

import com.kstn.group4.backend.booking.entity.Booking;
import com.kstn.group4.backend.booking.repository.BookingRepository;
import com.kstn.group4.backend.exception.BusinessException;
import com.kstn.group4.backend.exception.ForbiddenException;
import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.payment.dto.CreatePaymentRequest;
import com.kstn.group4.backend.payment.dto.CreatePaymentResponse;
import com.kstn.group4.backend.user.entity.User;
import com.kstn.group4.backend.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.text.SimpleDateFormat;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class VNPayService {

    private static final BigDecimal POINT_VALUE = BigDecimal.valueOf(100);

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Value("${vnpay.tmn-code}")
    private String tmnCode;

    @Value("${vnpay.hash-secret}")
    private String hashSecret;

    @Value("${vnpay.payment-url}")
    private String paymentUrl;

    @Value("${vnpay.return-url}")
    private String returnUrl;

    /**
     * Build the VNPay payment URL from a CreatePaymentRequest.
     * Amount is multiplied by 100 per VNPay spec (VND, no decimals).
     */
    @Transactional
    public CreatePaymentResponse buildPaymentUrl(CreatePaymentRequest request, HttpServletRequest httpRequest, Integer payerId) {
        Booking booking = bookingRepository.findByIdWithDetails(request.bookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt sân", "Booking"));

        if (booking.getPlayer() == null || !booking.getPlayer().getId().equals(payerId)) {
            throw new ForbiddenException("Bạn không có quyền thanh toán đơn đặt sân này");
        }

        if (booking.getPointsRedeemedAt() != null) {
            throw new BusinessException("Đơn đặt sân này đã được xác nhận thanh toán", "BOOKING_ALREADY_PAID");
        }

        User payer = userRepository.findById(payerId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng", "User"));

        int pointsToUse = request.pointsToUse() != null ? request.pointsToUse() : 0;
        BigDecimal originalAmount = booking.getTotalPrice() != null ? booking.getTotalPrice() : BigDecimal.ZERO;
        BigDecimal discountAmount = calculateDiscountAmount(pointsToUse, originalAmount, payer);
        BigDecimal payableAmount = originalAmount.subtract(discountAmount).setScale(0, RoundingMode.HALF_UP);

        if (payableAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Số điểm sử dụng phải nhỏ hơn tổng tiền thanh toán", "INVALID_POINTS_REDEMPTION");
        }

        booking.setPointsUsed(pointsToUse);
        booking.setPointsDiscountAmount(discountAmount);
        booking.setPointsRedeemedAt(null);
        bookingRepository.save(booking);

        String vnpTxnRef = String.valueOf(request.bookingId());
        long vnpAmount = payableAmount.longValue() * 100L;

        String vnpCreateDate = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
        // Expire after 15 minutes
        Calendar cal = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        cal.add(Calendar.MINUTE, 15);
        String vnpExpireDate = new SimpleDateFormat("yyyyMMddHHmmss").format(cal.getTime());

        String ipAddr = getClientIp(httpRequest);

        Map<String, String> vnpParams = new TreeMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", tmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(vnpAmount));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", vnpTxnRef);
        vnpParams.put("vnp_OrderInfo", "Thanh toan dat san #" + vnpTxnRef);
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", returnUrl);
        vnpParams.put("vnp_IpAddr", ipAddr);
        vnpParams.put("vnp_CreateDate", vnpCreateDate);
        vnpParams.put("vnp_ExpireDate", vnpExpireDate);

        // Build query string and hash
        StringBuilder queryBuilder = new StringBuilder();
        StringBuilder hashDataBuilder = new StringBuilder();

        for (Map.Entry<String, String> entry : vnpParams.entrySet()) {
            if (entry.getValue() != null && !entry.getValue().isEmpty()) {
                hashDataBuilder.append(entry.getKey()).append("=")
                        .append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
                queryBuilder.append(URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII))
                        .append("=")
                        .append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
                hashDataBuilder.append("&");
                queryBuilder.append("&");
            }
        }

        // Remove trailing &
        String hashData = hashDataBuilder.substring(0, hashDataBuilder.length() - 1);
        String query = queryBuilder.substring(0, queryBuilder.length() - 1);

        String secureHash = hmacSha512(hashSecret, hashData);
        String fullUrl = paymentUrl + "?" + query + "&vnp_SecureHash=" + secureHash;

        log.info("VNPay URL built for booking #{}: {}", request.bookingId(), fullUrl);
        return new CreatePaymentResponse(fullUrl, payableAmount, discountAmount, pointsToUse);
    }

    /**
     * Verify VNPay callback signature.
     */
    public boolean verifySignature(Map<String, String> params) {
        String receivedHash = params.get("vnp_SecureHash");
        if (receivedHash == null) return false;

        Map<String, String> sortedParams = new TreeMap<>(params);
        sortedParams.remove("vnp_SecureHash");
        sortedParams.remove("vnp_SecureHashType");

        StringBuilder hashDataBuilder = new StringBuilder();
        for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
            if (entry.getValue() != null && !entry.getValue().isEmpty()) {
                hashDataBuilder.append(entry.getKey()).append("=")
                        .append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII))
                        .append("&");
            }
        }
        String hashData = hashDataBuilder.substring(0, hashDataBuilder.length() - 1);
        String computedHash = hmacSha512(hashSecret, hashData);

        return computedHash.equalsIgnoreCase(receivedHash);
    }

    @Transactional
    public boolean settleSuccessfulPayment(String txnRef, String rawVnpAmount) {
        Integer bookingId;
        try {
            bookingId = Integer.valueOf(txnRef);
        } catch (NumberFormatException ex) {
            log.warn("Cannot settle membership points because txnRef is invalid: {}", txnRef);
            return false;
        }

        Booking booking = bookingRepository.findByIdWithDetails(bookingId).orElse(null);
        if (booking == null) {
            log.warn("Cannot settle membership points because booking {} was not found", bookingId);
            return false;
        }

        if (booking.getPointsRedeemedAt() != null) {
            return true;
        }

        int pointsUsed = booking.getPointsUsed() != null ? booking.getPointsUsed() : 0;
        BigDecimal discountAmount = booking.getPointsDiscountAmount() != null
                ? booking.getPointsDiscountAmount()
                : BigDecimal.ZERO;

        if (!matchesExpectedAmount(booking, discountAmount, rawVnpAmount)) {
            log.warn("VNPay amount does not match booking {} payable amount", bookingId);
            return false;
        }

        if (pointsUsed > 0) {
            Integer playerId = booking.getPlayer() != null ? booking.getPlayer().getId() : null;
            if (playerId == null || userRepository.deductMembershipPoints(playerId, pointsUsed) == 0) {
                log.warn("Cannot deduct {} membership points for booking {}", pointsUsed, bookingId);
                return false;
            }
        }

        booking.setPointsRedeemedAt(LocalDateTime.now());
        bookingRepository.save(booking);
        return true;
    }

    private BigDecimal calculateDiscountAmount(int pointsToUse, BigDecimal originalAmount, User payer) {
        if (pointsToUse < 0) {
            throw new BusinessException("Số điểm sử dụng không hợp lệ", "INVALID_POINTS_REDEMPTION");
        }

        if (pointsToUse == 0) {
            return BigDecimal.ZERO;
        }

        int currentPoints = payer.getMembershipPoints() != null ? payer.getMembershipPoints() : 0;
        if (pointsToUse > currentPoints) {
            throw new BusinessException("Bạn không có đủ điểm thành viên", "INSUFFICIENT_MEMBERSHIP_POINTS");
        }

        BigDecimal discountAmount = BigDecimal.valueOf(pointsToUse).multiply(POINT_VALUE);
        if (discountAmount.compareTo(originalAmount) >= 0) {
            throw new BusinessException("Số điểm sử dụng phải nhỏ hơn tổng tiền thanh toán", "INVALID_POINTS_REDEMPTION");
        }

        return discountAmount.setScale(2, RoundingMode.HALF_UP);
    }

    private boolean matchesExpectedAmount(Booking booking, BigDecimal discountAmount, String rawVnpAmount) {
        if (rawVnpAmount == null || rawVnpAmount.isBlank()) {
            return false;
        }

        BigDecimal totalPrice = booking.getTotalPrice() != null ? booking.getTotalPrice() : BigDecimal.ZERO;
        BigDecimal payableAmount = totalPrice.subtract(discountAmount).setScale(0, RoundingMode.HALF_UP);
        String expectedVnpAmount = String.valueOf(payableAmount.longValue() * 100L);
        return expectedVnpAmount.equals(rawVnpAmount);
    }

    private String hmacSha512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to compute HMAC-SHA512", e);
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isBlank()) {
            ipAddress = request.getRemoteAddr();
        }
        // Take only first IP if there's a chain
        if (ipAddress != null && ipAddress.contains(",")) {
            ipAddress = ipAddress.split(",")[0].trim();
        }
        return ipAddress != null ? ipAddress : "127.0.0.1";
    }
}
