package com.kstn.group4.backend.repository;

import com.kstn.group4.backend.entity.Booking;
import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, Integer> {

    List<Booking> findByPlayerIdOrderByCreatedAtDesc(Integer playerId);

    @Query("""
            SELECT b FROM Booking b
            WHERE b.pitch.manager.id = :managerId
            ORDER BY b.createdAt DESC
            """)
    List<Booking> findAllByManagerId(@Param("managerId") Integer managerId);

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
}
