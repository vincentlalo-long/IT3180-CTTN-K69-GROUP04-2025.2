package com.kstn.group4.backend.venue.repository;

import com.kstn.group4.backend.venue.entity.TimeSlot;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository for TimeSlot master data (11 fixed rows).
 *
 * TimeSlots are global — not tied to any pitch.
 * Used to render the schedule grid columns and for booking creation.
 */
@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Integer> {

    /**
     * Find all time slots ordered by slot number (1-11).
     * Used to render the grid header columns.
     *
     * @return list of all 11 time slots ordered by slot number
     */
    List<TimeSlot> findAllByOrderBySlotNumberAsc();

    /**
     * Find only active time slots, ordered by slot number.
     * Filtered to exclude globally disabled slots.
     *
     * @return list of active time slots ordered by slot number
     */
    @Query("SELECT ts FROM TimeSlot ts WHERE ts.isActive = true ORDER BY ts.slotNumber ASC")
    List<TimeSlot> findAllActiveOrderBySlotNumberAsc();

    /**
     * Find a single time slot by slot number.
     * Used for booking creation when client sends slotNumber.
     *
     * @param slotNumber the slot number (1-11)
     * @return optional containing the time slot if found
     */
    Optional<TimeSlot> findBySlotNumber(Integer slotNumber);
}
