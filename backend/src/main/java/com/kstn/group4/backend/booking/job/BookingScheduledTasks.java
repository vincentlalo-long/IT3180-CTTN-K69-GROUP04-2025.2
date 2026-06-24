package com.kstn.group4.backend.booking.job;

import com.kstn.group4.backend.booking.entity.Booking;
import com.kstn.group4.backend.booking.entity.BookingStatus;
import com.kstn.group4.backend.booking.repository.BookingRepository;
import com.kstn.group4.backend.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class BookingScheduledTasks {

    private final BookingRepository bookingRepository;
    private final BookingService bookingService;

    /**
     * Run every 1 minute.
     * Cancels any RESERVED (unpaid) bookings created more than 15 minutes ago.
     */
    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void cleanExpiredBookings() {
        LocalDateTime expirationThreshold = LocalDateTime.now().minusMinutes(10);
        
        List<Booking> expiredBookings = bookingRepository.findExpiredReservedBookings(expirationThreshold);
        
        if (!expiredBookings.isEmpty()) {
            log.info("Found {} expired reserved bookings to cancel", expiredBookings.size());
            for (Booking booking : expiredBookings) {
                try {
                    BookingStatus oldStatus = booking.getStatus();
                    booking.setStatus(BookingStatus.CANCELLED);
                    bookingRepository.save(booking);
                    bookingService.publishBookingStatusChanged(booking, oldStatus, BookingStatus.CANCELLED);
                    log.info("Cancelled expired booking ID: {}", booking.getId());
                } catch (Exception ex) {
                    log.error("Failed to cancel expired booking ID: " + booking.getId(), ex);
                }
            }
        }
    }
}
