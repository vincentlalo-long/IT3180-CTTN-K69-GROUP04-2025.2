package com.kstn.group4.backend.payment.service;

import com.kstn.group4.backend.booking.entity.Booking;
import com.kstn.group4.backend.booking.entity.BookingStatus;
import com.kstn.group4.backend.booking.repository.BookingRepository;
import com.kstn.group4.backend.booking.service.BookingPaymentService;
import com.kstn.group4.backend.exception.BusinessException;
import com.kstn.group4.backend.exception.ForbiddenException;
import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.notification.entity.NotificationType;
import com.kstn.group4.backend.notification.event.BookingStatusChangedEvent;
import com.kstn.group4.backend.notification.service.NotificationService;
import com.kstn.group4.backend.payment.dto.WalletPaymentRequest;
import com.kstn.group4.backend.payment.dto.WalletPaymentResponse;
import com.kstn.group4.backend.user.entity.User;
import com.kstn.group4.backend.user.repository.UserRepository;
import com.kstn.group4.backend.wallet.service.WalletService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WalletPaymentService {

    private static final BigDecimal POINT_VALUE = BigDecimal.valueOf(100);
    private static final int BOOKING_REWARD_POINTS = 20;

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;
    private final BookingPaymentService bookingPaymentService;
    private final ApplicationEventPublisher eventPublisher;
    private final NotificationService notificationService;

    @Transactional
    public WalletPaymentResponse payBookingDeposit(WalletPaymentRequest request, Integer payerId) {
        List<Booking> bookings = loadBookings(request.bookingId());
        validateBookingsForPayer(bookings, payerId);

        User payer = userRepository.findById(payerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found", "User"));

        int pointsToUse = request.pointsToUse() != null ? request.pointsToUse() : 0;
        BigDecimal totalBookingPrice = bookings.stream()
                .map(booking -> booking.getTotalPrice() != null ? booking.getTotalPrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal depositAmount = totalBookingPrice.multiply(BigDecimal.valueOf(0.5)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal discountAmount = calculateDiscountAmount(pointsToUse, depositAmount, payer);
        BigDecimal payableAmount = depositAmount.subtract(discountAmount).setScale(2, RoundingMode.HALF_UP);

        if (payableAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Payable amount must be greater than zero", "INVALID_POINTS_REDEMPTION");
        }

        User debitedPayer = walletService.debit(payerId, payableAmount);

        Booking firstBooking = bookings.get(0);
        firstBooking.setPointsUsed(pointsToUse);
        firstBooking.setPointsDiscountAmount(discountAmount);

        if (pointsToUse > 0 && userRepository.deductMembershipPoints(payerId, pointsToUse) == 0) {
            throw new BusinessException("Insufficient membership points", "INSUFFICIENT_MEMBERSHIP_POINTS");
        }

        userRepository.incrementMembershipPoints(payerId, bookings.size() * BOOKING_REWARD_POINTS);

        LocalDateTime now = LocalDateTime.now();
        for (Booking booking : bookings) {
            BookingStatus oldStatus = booking.getStatus();
            booking.setStatus(BookingStatus.BOOKED);
            booking.setPointsRedeemedAt(now);
            bookingRepository.save(booking);

            bookingPaymentService.recordPaidPayment(
                    booking,
                    debitedPayer,
                    bookingPaymentService.calculateDepositAmount(booking),
                    "WALLET"
            );

            if (oldStatus != BookingStatus.BOOKED) {
                publishBookingStatusChanged(booking, oldStatus, BookingStatus.BOOKED);
            }
        }

        notifyAdmins(bookings.get(0));

        return new WalletPaymentResponse(
                bookings.stream().map(Booking::getId).toList(),
                payableAmount,
                discountAmount,
                pointsToUse,
                debitedPayer.getWalletBalance()
        );
    }

    private List<Booking> loadBookings(String bookingIdStr) {
        if (bookingIdStr == null || bookingIdStr.isBlank()) {
            throw new BusinessException("Booking id is required", "INVALID_BOOKING_ID");
        }

        List<Booking> bookings = new ArrayList<>();
        for (Integer bookingId : parseBookingIds(bookingIdStr)) {
            bookings.add(bookingRepository.findByIdWithDetails(bookingId)
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId, "Booking")));
        }
        return bookings;
    }

    private List<Integer> parseBookingIds(String bookingIdStr) {
        List<Integer> bookingIds = new ArrayList<>();
        try {
            if (bookingIdStr.contains("-")) {
                for (String part : bookingIdStr.split("-")) {
                    bookingIds.add(Integer.valueOf(part.trim()));
                }
            } else {
                bookingIds.add(Integer.valueOf(bookingIdStr.trim()));
            }
        } catch (NumberFormatException ex) {
            throw new BusinessException("Invalid booking id", "INVALID_BOOKING_ID");
        }
        return bookingIds;
    }

    private void validateBookingsForPayer(List<Booking> bookings, Integer payerId) {
        for (Booking booking : bookings) {
            if (booking.getPlayer() == null || !booking.getPlayer().getId().equals(payerId)) {
                throw new ForbiddenException("You cannot pay this booking");
            }
            if (booking.getPointsRedeemedAt() != null) {
                throw new BusinessException("Booking has already been paid", "BOOKING_ALREADY_PAID");
            }
            if (booking.getStatus() != BookingStatus.RESERVED && booking.getStatus() != BookingStatus.PENDING) {
                throw new BusinessException("Booking is not waiting for deposit payment", "INVALID_PAYMENT_STATUS");
            }
        }
    }

    private BigDecimal calculateDiscountAmount(int pointsToUse, BigDecimal originalAmount, User payer) {
        if (pointsToUse < 0) {
            throw new BusinessException("Invalid membership points", "INVALID_POINTS_REDEMPTION");
        }
        if (pointsToUse == 0) {
            return BigDecimal.ZERO;
        }
        int currentPoints = payer.getMembershipPoints() != null ? payer.getMembershipPoints() : 0;
        if (pointsToUse > currentPoints) {
            throw new BusinessException("Insufficient membership points", "INSUFFICIENT_MEMBERSHIP_POINTS");
        }
        BigDecimal discountAmount = BigDecimal.valueOf(pointsToUse).multiply(POINT_VALUE);
        if (discountAmount.compareTo(originalAmount) >= 0) {
            throw new BusinessException("Membership point discount must be lower than payment amount", "INVALID_POINTS_REDEMPTION");
        }
        return discountAmount.setScale(2, RoundingMode.HALF_UP);
    }

    private void publishBookingStatusChanged(Booking booking, BookingStatus oldStatus, BookingStatus newStatus) {
        String pitchName = booking.getPitch() != null && booking.getPitch().getName() != null
                ? booking.getPitch().getName()
                : "N/A";

        eventPublisher.publishEvent(new BookingStatusChangedEvent(
                booking.getId(),
                booking.getPlayer() != null ? booking.getPlayer().getId() : null,
                oldStatus,
                newStatus,
                pitchName,
                booking.getBookingDate(),
                booking.getStartTime()
        ));
    }

    private void notifyAdmins(Booking booking) {
        String pitchName = booking.getPitch() != null && booking.getPitch().getName() != null
                ? booking.getPitch().getName()
                : "N/A";
        String date = booking.getBookingDate() != null ? booking.getBookingDate().toString() : "N/A";
        String time = booking.getStartTime() != null ? booking.getStartTime().toString().substring(0, 5) : "N/A";

        notificationService.createNotificationForAdmins(
                NotificationType.ADMIN_ALERT,
                "New booking paid from wallet",
                "Booking #" + booking.getId() + " for " + pitchName + " at " + time + " on " + date
                        + " has paid the deposit from wallet.",
                "BOOKING",
                String.valueOf(booking.getId())
        );
    }
}
