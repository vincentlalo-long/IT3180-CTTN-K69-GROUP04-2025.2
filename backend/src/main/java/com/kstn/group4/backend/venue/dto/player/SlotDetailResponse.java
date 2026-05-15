package com.kstn.group4.backend.venue.dto.player;

import java.math.BigDecimal;
import java.time.LocalTime;

/**
 * Represents detailed information about a single time slot in a pitch's availability schedule.
 * 
 * Used in PitchSlotsResponse to show all 11 time slots for a pitch on a given date.
 * Includes timing, pricing, and availability status for booking.
 */
public record SlotDetailResponse(
        /**
         * Unique identifier of the time slot.
         * Used by client to reference this slot when creating a booking.
         */
        Integer timeSlotId,
        
        /**
         * Sequential slot number (1-11) for display and reference.
         * Slot 1 = 06:00-07:30, Slot 2 = 07:30-09:00, ..., Slot 11 = 21:30-23:00
         */
        Integer slotNumber,
        
        /**
         * Start time of this slot (HH:MM format).
         * Example: 06:00, 07:30, 09:00
         */
        LocalTime startTime,
        
        /**
         * End time of this slot (HH:MM format).
         * Always 90 minutes after startTime.
         * Example: 07:30, 09:00, 10:30
         */
        LocalTime endTime,
        
        /**
         * Price in Vietnamese Dong (VND) for this slot.
         * Determines if slot is booked or available.
         * Pricing can differ between weekday and weekend for the same slot number.
         * Example: 50000, 60000, 75000 VND
         */
        BigDecimal price,
        
        /**
         * Availability status of this slot on the requested date.
         * true = available for booking
         * false = already booked or closed
         */
        Boolean isAvailable
) {
}
