package com.kstn.group4.backend.venue.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalTime;
import lombok.Getter;
import lombok.Setter;

/**
 * TimeSlot entity represents a fixed 90-minute time window for booking.
 *
 * This is MASTER DATA — exactly 11 rows exist in the entire system:
 * - Slot 1:  06:30 - 08:00
 * - Slot 2:  08:00 - 09:30
 * - ...
 * - Slot 11: 21:30 - 23:00
 *
 * TimeSlots are NOT tied to any specific pitch. They define the universal
 * schedule grid that all pitches share. Pricing per pitch per slot is
 * managed separately in PriceRule entity.
 *
 * UNIQUE constraint: (slot_number) ensures no duplicates.
 */
@Getter
@Setter
@Entity
@Table(
    name = "time_slots",
    uniqueConstraints = @UniqueConstraint(columnNames = {"slot_number"})
)
public class TimeSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /**
     * Sequential slot number (1-11).
     * Uniquely identifies a time slot across the entire system.
     */
    @Column(name = "slot_number", nullable = false)
    private Integer slotNumber;

    /**
     * Start time of this slot (HH:MM format).
     * Example: 06:30, 08:00, 09:30, etc.
     */
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    /**
     * End time of this slot (HH:MM format).
     * Example: 08:00, 09:30, 11:00, etc.
     * Always 90 minutes after startTime.
     */
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    /**
     * Flag indicating if this slot is globally available for booking.
     * Can be set to false to disable a time window system-wide.
     */
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = Boolean.TRUE;
}
