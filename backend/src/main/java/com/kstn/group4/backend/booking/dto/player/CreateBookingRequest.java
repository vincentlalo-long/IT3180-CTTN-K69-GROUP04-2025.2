package com.kstn.group4.backend.booking.dto.player;

import jakarta.validation.Valid;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class CreateBookingRequest {

        @NotNull(message = "pitchId không được để trống")
        private Integer pitchId;

        @NotNull(message = "bookingDate không được để trống")
        @FutureOrPresent(message = "bookingDate phải từ hôm nay trở đi")
        private LocalDate bookingDate;

        @NotNull(message = "timeSlotId không được để trống")
        private Integer timeSlotId;

        @Valid
        private List<ServiceRequest> services;

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

        public List<ServiceRequest> getServices() {
                return services;
        }

        public void setServices(List<ServiceRequest> services) {
                this.services = services;
        }

        public static class ServiceRequest {
                @NotNull(message = "serviceId không được để trống")
                private Integer serviceId;

                @NotNull(message = "quantity không được để trống")
                @Min(value = 1, message = "quantity phải lớn hơn 0")
                private Integer quantity;

                public Integer getServiceId() {
                        return serviceId;
                }

                public void setServiceId(Integer serviceId) {
                        this.serviceId = serviceId;
                }

                public Integer getQuantity() {
                        return quantity;
                }

                public void setQuantity(Integer quantity) {
                        this.quantity = quantity;
                }
        }
}
