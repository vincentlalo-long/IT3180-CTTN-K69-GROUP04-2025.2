package com.kstn.group4.backend.booking.service;

import com.kstn.group4.backend.booking.entity.Booking;
import com.kstn.group4.backend.booking.entity.BookingPayment;
import com.kstn.group4.backend.booking.entity.BookingStatus;
import com.kstn.group4.backend.booking.entity.PaymentStatus;
import com.kstn.group4.backend.booking.repository.BookingPaymentRepository;
import com.kstn.group4.backend.exception.BusinessException;
import com.kstn.group4.backend.user.entity.User;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookingPaymentService {

    private final BookingPaymentRepository bookingPaymentRepository;

    @Transactional
    public void recordPaidPayment(Booking booking, User payer, BigDecimal amount, String paymentMethod) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }
        if (booking == null || booking.getId() == null || payer == null || payer.getId() == null) {
            throw new BusinessException("Cannot record booking payment without booking and payer", "INVALID_PAYMENT_RECORD");
        }

        BookingPayment payment = new BookingPayment();
        payment.setBooking(booking);
        payment.setPayer(payer);
        payment.setPaidAmount(amount.setScale(2, RoundingMode.HALF_UP));
        payment.setPaymentMethod((paymentMethod == null || paymentMethod.isBlank()) ? "UNKNOWN" : paymentMethod.toUpperCase());
        payment.setPaymentStatus(PaymentStatus.PAID);
        bookingPaymentRepository.save(payment);
    }

    @Transactional(readOnly = true)
    public BigDecimal getRecordedPaidAmount(Integer bookingId) {
        if (bookingId == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal amount = bookingPaymentRepository.sumPaidAmountByBookingIdAndStatus(bookingId, PaymentStatus.PAID);
        return amount != null ? amount : BigDecimal.ZERO;
    }

    @Transactional(readOnly = true)
    public List<BookingPayment> getPaymentHistory(Integer bookingId) {
        return bookingPaymentRepository.findByBookingIdOrderByCreatedAtAsc(bookingId);
    }

    public BigDecimal getPaidAmountWithLegacyFallback(Booking booking) {
        if (booking == null || booking.getId() == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal recorded = getRecordedPaidAmount(booking.getId());
        if (recorded.compareTo(BigDecimal.ZERO) > 0) {
            return recorded;
        }

        if (booking.getPointsRedeemedAt() != null
                || booking.getStatus() == BookingStatus.BOOKED
                || booking.getStatus() == BookingStatus.CONFIRMED
                || booking.getStatus() == BookingStatus.PLAYING
                || booking.getStatus() == BookingStatus.COMPLETED) {
            return calculateDepositAmount(booking);
        }

        return BigDecimal.ZERO;
    }

    public BigDecimal calculateDepositAmount(Booking booking) {
        BigDecimal totalPrice = booking != null && booking.getTotalPrice() != null
                ? booking.getTotalPrice()
                : BigDecimal.ZERO;
        return totalPrice.multiply(BigDecimal.valueOf(0.5)).setScale(2, RoundingMode.HALF_UP);
    }
}
