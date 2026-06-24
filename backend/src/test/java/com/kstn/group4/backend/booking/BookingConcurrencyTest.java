package com.kstn.group4.backend.booking;

import com.kstn.group4.backend.booking.dto.player.CreateBookingRequest;
import com.kstn.group4.backend.booking.service.BookingService;
import com.kstn.group4.backend.exception.ResourceConflictException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class BookingConcurrencyTest {

    private enum Outcome {
        SUCCESS,
        CONFLICT
    }

    @Autowired
    private BookingService bookingService;

    @Autowired
    private EntityManager entityManager;

    @Test
    void createBooking_concurrentRequests_onlyOneSuccess() throws Exception {
        int pitchId = 1;
        int timeSlotId = 1;
        LocalDate bookingDate = LocalDate.now().plusDays(30);

        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);
        ExecutorService executor = Executors.newFixedThreadPool(2);

        Callable<Outcome> taskPlayer2 = createTask(1, pitchId, timeSlotId, bookingDate, ready, start);
        Callable<Outcome> taskPlayer3 = createTask(2, pitchId, timeSlotId, bookingDate, ready, start);

        Future<Outcome> result1 = executor.submit(taskPlayer2);
        Future<Outcome> result2 = executor.submit(taskPlayer3);

        assertThat(ready.await(5, TimeUnit.SECONDS)).isTrue();
        start.countDown();

        Outcome outcome1 = result1.get(10, TimeUnit.SECONDS);
        Outcome outcome2 = result2.get(10, TimeUnit.SECONDS);

        executor.shutdownNow();

        List<Outcome> outcomes = List.of(outcome1, outcome2);
        assertThat(outcomes).containsExactlyInAnyOrder(Outcome.SUCCESS, Outcome.CONFLICT);

        long bookingCount = countBookingsBySlotAndDate(timeSlotId, bookingDate);
        assertThat(bookingCount).isEqualTo(1);
    }

    private Callable<Outcome> createTask(
            Integer playerId,
            Integer pitchId,
            Integer timeSlotId,
            LocalDate bookingDate,
            CountDownLatch ready,
            CountDownLatch start
    ) {
        return () -> {
            CreateBookingRequest request = new CreateBookingRequest();
            request.setPitchId(pitchId);
            request.setTimeSlotId(timeSlotId);
            request.setBookingDate(bookingDate);

            ready.countDown();
            if (!start.await(5, TimeUnit.SECONDS)) {
                throw new IllegalStateException("Start signal not received");
            }

            try {
                bookingService.createBooking(playerId, request);
                return Outcome.SUCCESS;
            } catch (ResourceConflictException ex) {
                return Outcome.CONFLICT;
            }
        };
    }

    private long countBookingsBySlotAndDate(Integer timeSlotId, LocalDate bookingDate) {
        TypedQuery<Long> query = entityManager.createQuery(
                "SELECT COUNT(b) FROM Booking b WHERE b.timeSlot.id = :timeSlotId AND b.bookingDate = :bookingDate",
                Long.class
        );
        query.setParameter("timeSlotId", timeSlotId);
        query.setParameter("bookingDate", bookingDate);
        return query.getSingleResult();
    }
}

