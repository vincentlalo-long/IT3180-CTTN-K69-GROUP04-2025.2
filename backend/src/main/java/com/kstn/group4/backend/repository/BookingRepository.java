package com.kstn.group4.backend.repository;

import com.kstn.group4.backend.entity.Booking;
import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, Integer> {

    @EntityGraph(attributePaths = {"pitch"})
    List<Booking> findByPlayerIdOrderByCreatedAtDesc(Integer playerId);

    @EntityGraph(attributePaths = {"pitch"})
    List<Booking> findByPitchManagerIdOrderByCreatedAtDesc(Integer managerId);

    @EntityGraph(attributePaths = {"pitch"})
    List<Booking> findByPitchManagerIdAndStatusIgnoreCase(Integer managerId, String status);

    @EntityGraph(attributePaths = {"pitch", "pitch.manager"})
    @Query("SELECT b FROM Booking b WHERE b.id = :bookingId")
    Optional<Booking> findByIdWithPitchAndManager(@Param("bookingId") Integer bookingId);

    @EntityGraph(attributePaths = {"pitch"})
    @Query("SELECT b FROM Booking b WHERE b.id = :bookingId AND b.player.id = :playerId")
    Optional<Booking> findByIdAndPlayerId(@Param("bookingId") Integer bookingId,
                                          @Param("playerId") Integer playerId);

    @Query("""
            SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END
            FROM Booking b
            WHERE b.player.id = :playerId
              AND b.pitch.id = :pitchId
              AND UPPER(b.status) = 'COMPLETED'
            """)
    boolean existsCompletedBookingByPlayerAndPitch(@Param("playerId") Integer playerId,
                                                   @Param("pitchId") Integer pitchId);

    @Query("""
            SELECT b FROM Booking b
            WHERE b.pitch.id = :pitchId
              AND b.bookingDate = :bookingDate
              AND b.status IN :activeStatuses
              AND b.startTime < :endTime
              AND b.endTime > :startTime
            """)
    List<Booking> findOverlappingBookings(@Param("pitchId") Integer pitchId,
                                          @Param("bookingDate") LocalDate bookingDate,
                                          @Param("startTime") LocalTime startTime,
                                          @Param("endTime") LocalTime endTime,
                                          @Param("activeStatuses") Collection<String> activeStatuses);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT b FROM Booking b
            WHERE b.pitch.id = :pitchId
              AND b.bookingDate = :bookingDate
              AND b.status IN :activeStatuses
              AND b.startTime < :endTime
              AND b.endTime > :startTime
            """)
    List<Booking> findOverlappingBookingsForUpdate(@Param("pitchId") Integer pitchId,
                                                   @Param("bookingDate") LocalDate bookingDate,
                                                   @Param("startTime") LocalTime startTime,
                                                   @Param("endTime") LocalTime endTime,
                                                   @Param("activeStatuses") Collection<String> activeStatuses);

    List<Booking> findByPitchIdAndBookingDateAndStatusIn(Integer pitchId,
                                                         LocalDate bookingDate,
                                                         Collection<String> statuses);

    @Query(value = """
            SELECT COALESCE(SUM(bp.paid_amount), 0)
            FROM booking_payments bp
            JOIN bookings b ON b.id = bp.booking_id
            JOIN pitches p ON p.id = b.pitch_id
            WHERE p.manager_id = :managerId
              AND p.id IN (:pitchIds)
              AND bp.payment_status = 'PAID'
            """, nativeQuery = true)
    BigDecimal sumRevenueByManagerAndPitchIds(@Param("managerId") Integer managerId,
                                              @Param("pitchIds") List<Integer> pitchIds);

        @Query("""
          SELECT COUNT(b)
          FROM Booking b
          WHERE b.pitch.manager.id = :managerId
            AND b.pitch.id IN :pitchIds
          """)
        long countBookingsByManagerAndPitchIds(@Param("managerId") Integer managerId,
                 @Param("pitchIds") List<Integer> pitchIds);

        @Query("""
          SELECT COUNT(DISTINCT b.player.id)
          FROM Booking b
          WHERE b.pitch.manager.id = :managerId
            AND b.pitch.id IN :pitchIds
          """)
        long countUniqueCustomersByManagerAndPitchIds(@Param("managerId") Integer managerId,
                  @Param("pitchIds") List<Integer> pitchIds);

    @Query(value = """
            SELECT COALESCE(SUM(bp.paid_amount), 0)
            FROM booking_payments bp
            JOIN bookings b ON b.id = bp.booking_id
            JOIN pitches p ON p.id = b.pitch_id
            WHERE p.manager_id = :managerId
              AND p.id = :pitchId
              AND bp.payment_status = 'PAID'
            """, nativeQuery = true)
    BigDecimal sumRevenueByManagerAndPitchId(@Param("managerId") Integer managerId,
                                             @Param("pitchId") Integer pitchId);

        @Query("""
          SELECT COUNT(b)
          FROM Booking b
          WHERE b.pitch.manager.id = :managerId
            AND b.pitch.id = :pitchId
          """)
        long countBookingsByManagerAndPitchId(@Param("managerId") Integer managerId,
                @Param("pitchId") Integer pitchId);

        @Query("""
          SELECT COUNT(DISTINCT b.player.id)
          FROM Booking b
          WHERE b.pitch.manager.id = :managerId
            AND b.pitch.id = :pitchId
          """)
        long countUniqueCustomersByManagerAndPitchId(@Param("managerId") Integer managerId,
                 @Param("pitchId") Integer pitchId);

        @EntityGraph(attributePaths = {"player", "pitch"})
        @Query("""
          SELECT b FROM Booking b
          WHERE b.pitch.manager.id = :managerId
          ORDER BY b.createdAt DESC
          """)
        List<Booking> findRecentBookingsByManagerId(@Param("managerId") Integer managerId,
                Pageable pageable);

        @EntityGraph(attributePaths = {"player", "pitch"})
        @Query("""
          SELECT b FROM Booking b
          WHERE b.pitch.manager.id = :managerId
            AND b.pitch.id = :pitchId
          ORDER BY b.createdAt DESC
          """)
        List<Booking> findRecentBookingsByManagerIdAndPitchId(@Param("managerId") Integer managerId,
                    @Param("pitchId") Integer pitchId,
                    Pageable pageable);
}

