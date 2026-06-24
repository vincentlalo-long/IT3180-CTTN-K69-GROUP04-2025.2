package com.kstn.group4.backend.venue.repository;

import com.kstn.group4.backend.venue.entity.Pitch;
import com.kstn.group4.backend.venue.entity.PitchType;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PitchRepository extends JpaRepository<Pitch, Integer> {

    /**
     * Find the first available (unbooked) pitch in a venue with a specific type for a given date and time slot.
     * Uses NOT EXISTS to exclude pitches that already have a non-cancelled booking for that slot/date.
     */
    @Query("SELECT p FROM Pitch p WHERE p.venue.id = :venueId " +
            "AND p.pitchType = :pitchType " +
            "AND p.isActive = true " +
            "AND NOT EXISTS (" +
            "  SELECT b FROM com.kstn.group4.backend.booking.entity.Booking b " +
            "  WHERE b.pitch.id = p.id " +
            "  AND b.bookingDate = :bookingDate " +
            "  AND b.timeSlot.id = :timeSlotId " +
            "  AND b.status <> com.kstn.group4.backend.booking.entity.BookingStatus.CANCELLED" +
            ") ORDER BY p.id ASC")
    List<Pitch> findAvailablePitches(
            @Param("venueId") Integer venueId,
            @Param("pitchType") PitchType pitchType,
            @Param("bookingDate") LocalDate bookingDate,
            @Param("timeSlotId") Integer timeSlotId);

    boolean existsByVenueIdAndPitchTypeAndIsActiveTrue(Integer venueId, PitchType pitchType);

    List<Pitch> findByVenueId(Integer venueId);

    @Query(
        value = "SELECT p FROM Pitch p LEFT JOIN FETCH p.venue WHERE p.venue.id = :venueId",
        countQuery = "SELECT COUNT(p) FROM Pitch p WHERE p.venue.id = :venueId"
    )
    Page<Pitch> findByVenueIdWithVenue(@Param("venueId") Integer venueId, Pageable pageable);

    Page<Pitch> findByVenueId(Integer venueId, Pageable pageable);

        Page<Pitch> findByVenueIdAndVenueManagerId(Integer venueId, Integer managerId, Pageable pageable);

        Optional<Pitch> findByIdAndVenueManagerId(Integer id, Integer managerId);

        long countByVenueId(Integer venueId);

    @Query("SELECT p.venue.id, COUNT(p) FROM Pitch p WHERE p.venue.id IN :venueIds GROUP BY p.venue.id")
    List<Object[]> countPitchesGroupByVenueIds(@Param("venueIds") List<Integer> venueIds);

    List<Pitch> findByVenueIdAndIsActiveTrue(Integer venueId);

    @Query("SELECT DISTINCT p FROM Pitch p " +
            "LEFT JOIN FETCH p.priceRules " +
            "WHERE p.venue.id = :venueId AND p.isActive = true " +
            "ORDER BY p.id ASC")
    List<Pitch> findActiveByVenueIdWithPriceRules(@Param("venueId") Integer venueId);

    @Query("SELECT COUNT(p) FROM Pitch p WHERE p.isActive = true")
    long countActivePitches();

    // Lock sân khi đang thực hiện thanh toán/đặt sân để tránh Race Condition
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Pitch p WHERE p.id = :id")
    Optional<Pitch> findByIdForUpdate(@Param("id") Integer id);

    @Query("SELECT DISTINCT p FROM Pitch p " +
            "LEFT JOIN FETCH p.venue " +
            "LEFT JOIN FETCH p.priceRules " +
            "WHERE p.id = :id")
    Optional<Pitch> findByIdWithDetails(@Param("id") Integer id);

    @Query(value = "SELECT p.id as pitchId, p.name as pitchName, v.name as venueName, " +
            "ts.id as timeSlotId, ts.slot_number as slotNumber, ts.start_time as startTime, ts.end_time as endTime, ts.is_active as isActive, " +
            "b.status as bookingStatus, u.username as customerName, u.phone_number as customerPhone, " +
            "bp.paid_amount as depositAmount, " +
            "(p.base_price * COALESCE(pr.coefficient, 1.0 + " +
            "    CASE WHEN :isWeekend = true THEN 0.2 ELSE 0.0 END + " +
            "    CASE WHEN ts.start_time >= '17:00:00' AND ts.start_time < '22:00:00' THEN 0.3 ELSE 0.0 END" +
            ")) as price " +
            "FROM pitches p " +
            "JOIN venues v ON p.venue_id = v.id " +
            "CROSS JOIN time_slots ts " +
            "LEFT JOIN price_rules pr ON pr.pitch_id = p.id AND pr.slot_number = ts.slot_number AND pr.is_weekend = :isWeekend " +
            "LEFT JOIN bookings b ON b.pitch_id = p.id AND b.time_slot_id = ts.id AND b.booking_date = :date " +
            "    AND b.status <> 'CANCELLED' " +
            "LEFT JOIN users u ON b.player_id = u.id " +
            "LEFT JOIN booking_payments bp ON bp.booking_id = b.id " +
            "WHERE (:venueId IS NULL OR p.venue_id = :venueId) " +
            "ORDER BY p.id ASC, ts.slot_number ASC", nativeQuery = true)
    List<PitchScheduleProjection> findPitchSchedulesNatively(
            @Param("venueId") Integer venueId,
            @Param("date") java.time.LocalDate date,
            @Param("isWeekend") boolean isWeekend);
}