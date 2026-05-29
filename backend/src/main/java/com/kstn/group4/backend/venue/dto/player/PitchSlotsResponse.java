package com.kstn.group4.backend.venue.dto.player;

import java.time.LocalDate;
import java.util.List;

/**
 * Represents complete slot availability and pricing for a single pitch on a specific date.
 * 
 * Used by players to view all 11 time slots for a pitch, their availability,
 * and pricing for the requested booking date.
 * 
 * Response format for: GET /player/venues/pitches/{pitchId}/slots?date=2026-05-13
 */
public record PitchSlotsResponse(
        /**
         * ID of the pitch.
         */
        Integer pitchId,
        
        /**
         * Display name of the pitch (e.g., "SAN_5_A", "SAN_7_B").
         */
        String pitchName,
        
        /**
         * Target booking date for these slot availabilities.
         * Allows client to request slots for different dates.
         */
        LocalDate bookingDate,
        
        /**
         * Flag indicating if the requested date falls on weekend.
         * Weekend (Saturday/Sunday) prices may differ from weekday prices.
         * Used for pricing calculation and client-side display.
         */
        Boolean isWeekend,
        
        /**
         * Complete list of 11 time slots for this pitch on the requested date.
         * Each slot includes timing, pricing, and current availability status.
         * Ordered by slot number (1-11) from earliest to latest.
         */
        List<SlotDetailResponse> slots
) {
}
