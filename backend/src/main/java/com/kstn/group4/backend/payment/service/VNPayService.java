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

import com.kstn.group4.backend.booking.entity.BookingStatus;
import com.kstn.group4.backend.notification.entity.NotificationType;
import com.kstn.group4.backend.notification.event.BookingStatusChangedEvent;
import com.kstn.group4.backend.notification.service.NotificationService;
import org.springframework.context.ApplicationEventPublisher;

@Slf4j
@Service
@RequiredArgsConstructor
public class VNPayService {

    private static final BigDecimal POINT_VALUE = BigDecimal.valueOf(100);
    private static final int BOOKING_REWARD_POINTS = 20;

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final NotificationService notificationService;

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
        String bookingIdStr = request.bookingId();
        if (bookingIdStr == null || bookingIdStr.isBlank()) {
            throw new BusinessException("Mã đơn đặt sân không được để trống", "INVALID_BOOKING_ID");
        }

        List<Integer> bookingIds = new ArrayList<>();
        if (bookingIdStr.contains("-")) {
            for (String part : bookingIdStr.split("-")) {
                bookingIds.add(Integer.valueOf(part.trim()));
            }
        } else {
            bookingIds.add(Integer.valueOf(bookingIdStr.trim()));
        }

        List<Booking> bookings = new ArrayList<>();
        for (Integer id : bookingIds) {
            Booking b = bookingRepository.findByIdWithDetails(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt sân với ID: " + id, "Booking"));
            bookings.add(b);
        }

        for (Booking b : bookings) {
            if (b.getPlayer() == null || !b.getPlayer().getId().equals(payerId)) {
                throw new ForbiddenException("Bạn không có quyền thanh toán đơn đặt sân này");
            }
            if (b.getPointsRedeemedAt() != null) {
                throw new BusinessException("Đơn đặt sân này đã được xác nhận thanh toán", "BOOKING_ALREADY_PAID");
            }
        }

        User payer = userRepository.findById(payerId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng", "User"));

        int pointsToUse = request.pointsToUse() != null ? request.pointsToUse() : 0;
        BigDecimal totalBookingPrice = BigDecimal.ZERO;
        for (Booking b : bookings) {
            totalBookingPrice = totalBookingPrice.add(b.getTotalPrice() != null ? b.getTotalPrice() : BigDecimal.ZERO);
        }

        BigDecimal depositAmount = totalBookingPrice.multiply(BigDecimal.valueOf(0.5)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal discountAmount = calculateDiscountAmount(pointsToUse, depositAmount, payer);
        BigDecimal payableAmount = depositAmount.subtract(discountAmount).setScale(0, RoundingMode.HALF_UP);

        if (payableAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Số điểm sử dụng phải nhỏ hơn tổng tiền thanh toán", "INVALID_POINTS_REDEMPTION");
        }

        Booking firstBooking = bookings.get(0);
        firstBooking.setPointsUsed(pointsToUse);
        firstBooking.setPointsDiscountAmount(discountAmount);

        for (Booking b : bookings) {
            b.setPointsRedeemedAt(null);
            bookingRepository.save(b);
        }

        String vnpTxnRef = bookingIdStr + "_" + System.currentTimeMillis();
        long vnpAmount = payableAmount.longValue() * 100L;

        String vnpCreateDate = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
        // Expire after 10 minutes
        Calendar cal = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        cal.add(Calendar.MINUTE, 10);
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
        String bookingIdStr = txnRef;
        if (txnRef != null && txnRef.contains("_")) {
            bookingIdStr = txnRef.split("_")[0];
        }

        List<Integer> bookingIds = new ArrayList<>();
        try {
            if (bookingIdStr != null && bookingIdStr.contains("-")) {
                for (String part : bookingIdStr.split("-")) {
                    bookingIds.add(Integer.valueOf(part.trim()));
                }
            } else if (bookingIdStr != null) {
                bookingIds.add(Integer.valueOf(bookingIdStr.trim()));
            }
        } catch (NumberFormatException ex) {
            log.warn("Cannot settle payment because txnRef is invalid: {}", txnRef);
            return false;
        }

        if (bookingIds.isEmpty()) {
            return false;
        }

        List<Booking> bookings = new ArrayList<>();
        for (Integer id : bookingIds) {
            Booking b = bookingRepository.findByIdWithDetails(id).orElse(null);
            if (b == null) {
                log.warn("Cannot settle payment because booking {} was not found", id);
                return false;
            }
            bookings.add(b);
        }

        Booking firstBooking = bookings.get(0);
        if (firstBooking.getPointsRedeemedAt() != null) {
            return true;
        }

        int pointsUsed = firstBooking.getPointsUsed() != null ? firstBooking.getPointsUsed() : 0;
        BigDecimal discountAmount = firstBooking.getPointsDiscountAmount() != null
                ? firstBooking.getPointsDiscountAmount()
                : BigDecimal.ZERO;

        if (!matchesExpectedAmount(bookings, discountAmount, rawVnpAmount)) {
            log.warn("VNPay amount does not match booking list {} payable amount", bookingIdStr);
            return false;
        }

        if (pointsUsed > 0) {
            Integer playerId = firstBooking.getPlayer() != null ? firstBooking.getPlayer().getId() : null;
            if (playerId == null || userRepository.deductMembershipPoints(playerId, pointsUsed) == 0) {
                log.warn("Cannot deduct {} membership points for booking {}", pointsUsed, firstBooking.getId());
                return false;
            }
        }

        Integer rewardPlayerId = firstBooking.getPlayer() != null ? firstBooking.getPlayer().getId() : null;
        if (rewardPlayerId != null) {
            userRepository.incrementMembershipPoints(rewardPlayerId, bookings.size() * BOOKING_REWARD_POINTS);
        }

        LocalDateTime now = LocalDateTime.now();
        for (Booking booking : bookings) {
            BookingStatus oldStatus = booking.getStatus();
            booking.setStatus(BookingStatus.BOOKED);
            booking.setPointsRedeemedAt(now);
            bookingRepository.save(booking);

            if (oldStatus != BookingStatus.BOOKED) {
                String pitchName = booking.getPitch() != null && booking.getPitch().getName() != null
                        ? booking.getPitch().getName()
                        : "N/A";
                eventPublisher.publishEvent(new BookingStatusChangedEvent(
                        booking.getId(),
                        booking.getPlayer() != null ? booking.getPlayer().getId() : null,
                        oldStatus,
                        BookingStatus.BOOKED,
                        pitchName,
                        booking.getBookingDate(),
                        booking.getStartTime()
                ));
            }
        }

        // Gửi thông báo cho Admin: có đơn đặt sân mới thanh toán cọc thành công
        Booking notifBooking = bookings.get(0);
        String pitchNameNotif = notifBooking.getPitch() != null && notifBooking.getPitch().getName() != null
                ? notifBooking.getPitch().getName() : "N/A";
        String dateNotif = notifBooking.getBookingDate() != null ? notifBooking.getBookingDate().toString() : "N/A";
        String timeNotif = notifBooking.getStartTime() != null
                ? notifBooking.getStartTime().toString().substring(0, 5) : "N/A";
        notificationService.createNotificationForAdmins(
                NotificationType.ADMIN_ALERT,
                "Đơn đặt sân mới thành công",
                "Đơn #" + notifBooking.getId() + " đặt sân " + pitchNameNotif
                        + " ca " + timeNotif + " ngày " + dateNotif
                        + " đã thanh toán cọc thành công.",
                "BOOKING",
                String.valueOf(notifBooking.getId())
        );

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

    private boolean matchesExpectedAmount(List<Booking> bookings, BigDecimal discountAmount, String rawVnpAmount) {
        if (rawVnpAmount == null || rawVnpAmount.isBlank()) {
            return false;
        }

        BigDecimal totalPrice = BigDecimal.ZERO;
        for (Booking booking : bookings) {
            totalPrice = totalPrice.add(booking.getTotalPrice() != null ? booking.getTotalPrice() : BigDecimal.ZERO);
        }
        BigDecimal depositAmount = totalPrice.multiply(BigDecimal.valueOf(0.5)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal payableAmount = depositAmount.subtract(discountAmount).setScale(0, RoundingMode.HALF_UP);
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
