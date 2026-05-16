package com.kstn.group4.backend.venue.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

/**
 * TimeSlot entity represents a fixed time window (90 minutes) for booking a pitch.
 * 
 * Each pitch has 11 predefined time slots (06:00 - 23:00).
 * - Slot 1: 06:00 - 07:30
 * - Slot 2: 07:30 - 09:00
 * - ...
 * - Slot 11: 21:30 - 23:00
 * 
 * TimeSlots are created once and never change (master data).
 * Pricing is managed separately in PriceRule entity to allow flexible pricing policies.
 * 
 * UNIQUE constraint: (pitch_id, slot_number) prevents duplicate slots per pitch.
 * ON DELETE CASCADE ensures slots are deleted when pitch is deleted.
 */
@Getter
@Setter
@Entity
@Table(
    name = "time_slots",
    uniqueConstraints = @UniqueConstraint(columnNames = {"pitch_id", "slot_number"})
)
public class TimeSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /**
     * The pitch this time slot belongs to.
     * Many time slots belong to one pitch.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pitch_id", nullable = false)
    private Pitch pitch;

    /**
     * Sequential slot number (1-11).
     * Combined with pitch_id, uniquely identifies a time slot.
     */
    @Column(name = "slot_number", nullable = false)
    private Integer slotNumber;

    /**
     * Start time of this slot (HH:MM format).
     * Example: 06:00, 07:30, 09:00, etc.
     */
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    /**
     * End time of this slot (HH:MM format).
     * Example: 07:30, 09:00, 10:30, etc.
     * Always 90 minutes after startTime.
     */
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    /**
     * Flag indicating if this slot is available for booking.
     * Can be set to false if pitch temporarily closes this slot.
     */
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = Boolean.TRUE;

    /**
     * One time slot can have many bookings (one per day).
     * Cascade DELETE orphan bookings when time slot is deleted (unlikely but safe).
     */
    @OneToMany(mappedBy = "timeSlot", fetch = FetchType.LAZY)
    private List<com.kstn.group4.backend.booking.entity.Booking> bookings = new ArrayList<>();
}
