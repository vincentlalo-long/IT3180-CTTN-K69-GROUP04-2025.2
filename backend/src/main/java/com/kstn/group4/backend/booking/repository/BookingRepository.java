package com.kstn.group4.backend.booking.repository;

import com.kstn.group4.backend.booking.entity.Booking;
import com.kstn.group4.backend.booking.entity.BookingStatus;
import java.math.BigDecimal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {

    /**
     * Find a booking by ID with all related entities fetched (player and pitch).
     * Uses JOIN FETCH to eagerly load relationships and prevent LazyInitializationException.
     */
    @Query("SELECT b FROM Booking b " +
            "LEFT JOIN FETCH b.player " +
            "LEFT JOIN FETCH b.pitch " +
            "WHERE b.id = :id")
    Optional<Booking> findByIdWithDetails(@Param("id") Integer id);

    /**
     * Search bookings by filters (date, status, pitchId) with pagination.
     * Uses LEFT JOIN FETCH to eagerly load player and pitch to avoid N+1 select problem.
     * All filter parameters are nullable.
     */
    @Query("SELECT DISTINCT b FROM Booking b " +
            "LEFT JOIN FETCH b.player " +
            "LEFT JOIN FETCH b.pitch " +
            "WHERE (:date IS NULL OR b.bookingDate = :date) " +
            "AND (:status IS NULL OR b.status = :status) " +
            "AND (:pitchId IS NULL OR b.pitch.id = :pitchId) " +
            "ORDER BY b.bookingDate DESC, b.startTime DESC")
    Page<Booking> searchByFilters(
            @Param("date") LocalDate date,
            @Param("status") BookingStatus status,
            @Param("pitchId") Integer pitchId,
            Pageable pageable
    );

    /**
     * Find all bookings by player ID with eager loading (for player operations).
     */
    @Query("SELECT b FROM Booking b " +
            "LEFT JOIN FETCH b.player " +
            "LEFT JOIN FETCH b.pitch " +
            "WHERE b.player.id = :playerId " +
            "ORDER BY b.bookingDate DESC")
    List<Booking> findByPlayerId(@Param("playerId") Integer playerId);

    /**
     * Find bookings by player ID with pagination and eager loading.
     */
    @Query("SELECT DISTINCT b FROM Booking b " +
            "LEFT JOIN FETCH b.player " +
            "LEFT JOIN FETCH b.pitch " +
            "WHERE b.player.id = :playerId " +
            "ORDER BY b.bookingDate DESC, b.startTime DESC")
    Page<Booking> findByPlayerId(@Param("playerId") Integer playerId, Pageable pageable);

    /**
     * Find a specific booking by ID and player ID with eager loading (for ownership verification).
     */
    @Query("SELECT b FROM Booking b " +
            "LEFT JOIN FETCH b.player " +
            "LEFT JOIN FETCH b.pitch " +
            "WHERE b.id = :bookingId AND b.player.id = :playerId")
    Optional<Booking> findByIdAndPlayerId(@Param("bookingId") Integer bookingId, @Param("playerId") Integer playerId);

    /**
     * Find bookings by pitch ID with eager loading (for venue operations).
     */
    @Query("SELECT b FROM Booking b " +
            "LEFT JOIN FETCH b.player " +
            "LEFT JOIN FETCH b.pitch " +
            "WHERE b.pitch.id = :pitchId " +
            "ORDER BY b.bookingDate DESC")
    List<Booking> findByPitchId(@Param("pitchId") Integer pitchId);

    @Query("SELECT DISTINCT b FROM Booking b " +
            "JOIN FETCH b.pitch p " +
            "JOIN p.venue v " +
            "WHERE v.id = :venueId " +
            "AND b.bookingDate = :bookingDate " +
            "AND b.status <> com.kstn.group4.backend.booking.entity.BookingStatus.CANCELLED")
    List<Booking> findConfirmedByVenueIdAndBookingDate(
            @Param("venueId") Integer venueId,
            @Param("bookingDate") LocalDate bookingDate
    );

    /**
     * Find all confirmed bookings for a specific pitch on a given date.
     * Used to check slot availability and pricing for single pitch view.
     * Eagerly loads timeSlot and pitch to avoid LazyInitializationException.
     * Excludes CANCELLED bookings from the result.
     */
    @Query("SELECT b FROM Booking b " +
            "LEFT JOIN FETCH b.timeSlot " +
            "LEFT JOIN FETCH b.pitch " +
            "WHERE b.pitch.id = :pitchId " +
            "AND b.bookingDate = :bookingDate " +
            "AND b.status <> com.kstn.group4.backend.booking.entity.BookingStatus.CANCELLED")
    List<Booking> findConfirmedByPitchIdAndBookingDate(
            @Param("pitchId") Integer pitchId,
            @Param("bookingDate") LocalDate bookingDate
    );

    /**
     * Find bookings by pitch ID with pagination and eager loading.
     */
    @Query("SELECT DISTINCT b FROM Booking b " +
            "LEFT JOIN FETCH b.player " +
            "LEFT JOIN FETCH b.pitch " +
            "WHERE b.pitch.id = :pitchId " +
            "ORDER BY b.bookingDate DESC, b.startTime DESC")
    Page<Booking> findByPitchId(@Param("pitchId") Integer pitchId, Pageable pageable);

    /**
     * Find bookings by booking date with eager loading.
     */
    @Query("SELECT b FROM Booking b " +
            "LEFT JOIN FETCH b.player " +
            "LEFT JOIN FETCH b.pitch " +
            "WHERE b.bookingDate = :bookingDate " +
            "ORDER BY b.startTime")
    List<Booking> findByBookingDate(@Param("bookingDate") LocalDate bookingDate);

    @Query("SELECT COUNT(b) > 0 FROM Booking b " +
            "WHERE b.timeSlot.id = :timeSlotId " +
            "AND b.bookingDate = :bookingDate " +
            "AND b.status <> com.kstn.group4.backend.booking.entity.BookingStatus.CANCELLED")
    boolean existsByTimeSlotIdAndBookingDate(
            @Param("timeSlotId") Integer timeSlotId,
            @Param("bookingDate") LocalDate bookingDate
    );

    @Query("SELECT COUNT(b) > 0 FROM Booking b " +
            "WHERE b.pitch.id = :pitchId " +
            "AND b.bookingDate = :bookingDate " +
            "AND b.status <> com.kstn.group4.backend.booking.entity.BookingStatus.CANCELLED " +
            "AND :startTime < b.endTime " +
            "AND :endTime > b.startTime")
    boolean existsOverlapping(
            @Param("pitchId") Integer pitchId,
            @Param("bookingDate") LocalDate bookingDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );

    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b " +
            "WHERE b.pitch.venue.id = :venueId " +
            "AND b.pitch.venue.managerId = :managerId " +
            "AND b.status <> com.kstn.group4.backend.booking.entity.BookingStatus.CANCELLED")
    BigDecimal sumRevenueByVenueIdAndManagerId(
            @Param("venueId") Integer venueId,
            @Param("managerId") Integer managerId
    );
}
