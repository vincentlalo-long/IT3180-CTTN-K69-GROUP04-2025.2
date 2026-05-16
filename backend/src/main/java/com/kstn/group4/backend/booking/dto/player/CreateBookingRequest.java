package com.kstn.group4.backend.booking.dto.player;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class CreateBookingRequest {

        @NotNull(message = "pitchId không được để trống")
        private Integer pitchId;

        @NotNull(message = "bookingDate không được để trống")
        @FutureOrPresent(message = "bookingDate phải từ hôm nay trở đi")
        private LocalDate bookingDate;

        @NotNull(message = "timeSlotId không được để trống")
        private Integer timeSlotId;

        public Integer getPitchId() {
                return pitchId;
        }

        public void setPitchId(Integer pitchId) {
                this.pitchId = pitchId;
        }

        public LocalDate getBookingDate() {
                return bookingDate;
        }

        public void setBookingDate(LocalDate bookingDate) {
                this.bookingDate = bookingDate;
        }

        public Integer getTimeSlotId() {
                return timeSlotId;
        }

        public void setTimeSlotId(Integer timeSlotId) {
                this.timeSlotId = timeSlotId;
        }
}
