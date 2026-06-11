package com.kstn.group4.backend.notification.event;

import com.kstn.group4.backend.booking.entity.BookingStatus;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class BookingStatusChangedEvent {
    private final Integer bookingId;
    private final Integer recipientId;
    private final BookingStatus oldStatus;
    private final BookingStatus newStatus;
    private final String pitchName;
    private final LocalDate bookingDate;
    private final LocalTime startTime;
}
