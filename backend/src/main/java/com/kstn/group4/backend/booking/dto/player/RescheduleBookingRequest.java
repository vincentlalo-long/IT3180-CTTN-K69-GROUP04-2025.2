package com.kstn.group4.backend.booking.dto.player;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record RescheduleBookingRequest(
        @NotNull(message = "bookingDate khong duoc de trong")
        @FutureOrPresent(message = "bookingDate phai la hom nay hoac tuong lai")
        LocalDate bookingDate,

        @NotNull(message = "timeSlotId khong duoc de trong")
        Integer timeSlotId
) {
}
