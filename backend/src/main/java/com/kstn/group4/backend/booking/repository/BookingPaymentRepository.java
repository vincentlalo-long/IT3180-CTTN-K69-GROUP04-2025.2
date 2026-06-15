package com.kstn.group4.backend.booking.repository;

import com.kstn.group4.backend.booking.entity.BookingPayment;
import com.kstn.group4.backend.booking.entity.PaymentStatus;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingPaymentRepository extends JpaRepository<BookingPayment, Integer> {

    @Query("SELECT COALESCE(SUM(bp.paidAmount), 0) FROM BookingPayment bp " +
            "WHERE bp.booking.id = :bookingId AND bp.paymentStatus = :status")
    BigDecimal sumPaidAmountByBookingIdAndStatus(
            @Param("bookingId") Integer bookingId,
            @Param("status") PaymentStatus status
    );

    List<BookingPayment> findByBookingIdOrderByCreatedAtAsc(Integer bookingId);
}
