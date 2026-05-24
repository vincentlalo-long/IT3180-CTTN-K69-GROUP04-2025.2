package com.kstn.group4.backend.venue.repository;

import com.kstn.group4.backend.venue.entity.Pitch;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PitchRepository extends JpaRepository<Pitch, Integer> {

    List<Pitch> findByVenueId(Integer venueId);

        Page<Pitch> findByVenueIdAndVenueManagerId(Integer venueId, Integer managerId, Pageable pageable);

        Optional<Pitch> findByIdAndVenueManagerId(Integer id, Integer managerId);

        long countByVenueId(Integer venueId);

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
            "ts.id as timeSlotId, ts.start_time as startTime, ts.end_time as endTime, ts.is_active as isActive, " +
            "b.status as bookingStatus, u.username as customerName, u.phone_number as customerPhone, " +
            "bp.paid_amount as depositAmount " +
            "FROM pitches p " +
            "JOIN venues v ON p.venue_id = v.id " +
            "JOIN time_slots ts ON ts.pitch_id = p.id " +
            "LEFT JOIN bookings b ON b.time_slot_id = ts.id AND b.booking_date = :date " +
            "LEFT JOIN users u ON b.player_id = u.id " +
            "LEFT JOIN booking_payments bp ON bp.booking_id = b.id " +
            "WHERE (:venueId IS NULL OR p.venue_id = :venueId)", nativeQuery = true)
    List<PitchScheduleProjection> findPitchSchedulesNatively(@Param("venueId") Integer venueId, @Param("date") java.time.LocalDate date);
}