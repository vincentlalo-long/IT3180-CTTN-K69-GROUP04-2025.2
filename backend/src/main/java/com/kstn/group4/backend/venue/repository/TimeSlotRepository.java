package com.kstn.group4.backend.venue.repository;

import com.kstn.group4.backend.venue.entity.TimeSlot;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository for TimeSlot entity with pessimistic locking support for race condition prevention.
 * 
 * TimeSlots are master data (read-heavy, write-infrequent).
 * Locking is only needed during booking creation to prevent race conditions.
 */
@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Integer> {

    /**
     * Find all time slots for a specific pitch, ordered by slot number.
     * Used to fetch the complete slot schedule for a pitch.
     * 
     * @param pitchId the pitch ID
     * @return list of time slots ordered by slot number (1-11)
     */
    @Query("SELECT ts FROM TimeSlot ts WHERE ts.pitch.id = :pitchId ORDER BY ts.slotNumber ASC")
    List<TimeSlot> findByPitchIdOrderBySlotNumberAsc(@Param("pitchId") Integer pitchId);

    /**
     * Find only active time slots for a specific pitch.
     * Filtered to exclude temporarily closed slots.
     * 
     * @param pitchId the pitch ID
     * @return list of active time slots ordered by slot number
     */
    @Query("SELECT ts FROM TimeSlot ts WHERE ts.pitch.id = :pitchId AND ts.isActive = true ORDER BY ts.slotNumber ASC")
    List<TimeSlot> findActiveByPitchIdOrderBySlotNumberAsc(@Param("pitchId") Integer pitchId);

    /**
     * Find a single time slot by pitch ID and slot number (no locking).
     * Used for read-only operations (checking availability, getting slot details).
     * 
     * @param pitchId the pitch ID
     * @param slotNumber the slot number (1-11)
     * @return optional containing the time slot if found
     */
    @Query("SELECT ts FROM TimeSlot ts WHERE ts.pitch.id = :pitchId AND ts.slotNumber = :slotNumber")
    Optional<TimeSlot> findByPitchIdAndSlotNumber(
            @Param("pitchId") Integer pitchId,
            @Param("slotNumber") Integer slotNumber
    );

    /**
     * Find a time slot by ID with PESSIMISTIC_WRITE lock for booking creation.
     * 
     * CRITICAL: Used during createBooking() to:
     * 1. Lock the time slot row
     * 2. Prevent concurrent bookings on the same slot
     * 3. Ensure UNIQUE(booking_date, time_slot_id) constraint is checked atomically
     * 
     * Must be called within @Transactional context to maintain lock until transaction end.
     * 
     * @param id the time slot ID
     * @return optional containing the locked time slot
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT ts FROM TimeSlot ts WHERE ts.id = :id")
    Optional<TimeSlot> findByIdForUpdate(@Param("id") Integer id);

    /**
     * Find a time slot by pitch ID and slot number with PESSIMISTIC_WRITE lock.
     * 
     * Alternative to findByIdForUpdate() when client sends slotNumber instead of timeSlotId.
     * Used in booking creation to lock before conflict checking.
     * 
     * @param pitchId the pitch ID
     * @param slotNumber the slot number (1-11)
     * @return optional containing the locked time slot
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT ts FROM TimeSlot ts WHERE ts.pitch.id = :pitchId AND ts.slotNumber = :slotNumber")
    Optional<TimeSlot> findByPitchIdAndSlotNumberForUpdate(
            @Param("pitchId") Integer pitchId,
            @Param("slotNumber") Integer slotNumber
    );

    /**
     * Find all time slots for a pitch within a specific time range (for venue opening hours validation).
     * Used to check if requested slots fall within venue operating hours.
     * 
     * @param pitchId the pitch ID
     * @return list of time slots ordered by slot number
     */
    @Query("SELECT ts FROM TimeSlot ts WHERE ts.pitch.id = :pitchId AND ts.isActive = true")
    List<TimeSlot> findAllActiveTimeSlotsByPitchId(@Param("pitchId") Integer pitchId);

    /**
     * Check if a time slot exists for the given pitch.
     * Lightweight operation for validation.
     * 
     * @param pitchId the pitch ID
     * @param slotNumber the slot number
     * @return true if time slot exists, false otherwise
     */
    @Query("SELECT COUNT(ts) > 0 FROM TimeSlot ts WHERE ts.pitch.id = :pitchId AND ts.slotNumber = :slotNumber")
    boolean existsByPitchIdAndSlotNumber(
            @Param("pitchId") Integer pitchId,
            @Param("slotNumber") Integer slotNumber
    );
}
