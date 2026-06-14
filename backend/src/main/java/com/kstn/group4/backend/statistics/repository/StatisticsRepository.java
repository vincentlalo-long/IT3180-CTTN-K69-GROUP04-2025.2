package com.kstn.group4.backend.statistics.repository;

import com.kstn.group4.backend.booking.entity.Booking;
import com.kstn.group4.backend.statistics.dto.PitchPerformanceDto;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface StatisticsRepository extends Repository<Booking, Integer> {

    @Query("SELECT COALESCE(SUM(CASE " +
           "  WHEN b.status = com.kstn.group4.backend.booking.entity.BookingStatus.COMPLETED THEN b.totalPrice " +
           "  WHEN b.status IN (com.kstn.group4.backend.booking.entity.BookingStatus.BOOKED, " +
           "                    com.kstn.group4.backend.booking.entity.BookingStatus.CONFIRMED, " +
           "                    com.kstn.group4.backend.booking.entity.BookingStatus.PLAYING) THEN b.totalPrice * 0.5 " +
           "  ELSE 0 END), 0) FROM Booking b " +
           "WHERE (:venueId IS NULL OR b.pitch.venue.id = :venueId) " +
           "AND b.bookingDate >= :startDate AND b.bookingDate <= :endDate")
    BigDecimal calculateTotalRevenue(
            @Param("venueId") Integer venueId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(b) FROM Booking b " +
           "WHERE (:venueId IS NULL OR b.pitch.venue.id = :venueId) " +
           "AND b.bookingDate >= :startDate AND b.bookingDate <= :endDate")
    Long countTotalBookings(
            @Param("venueId") Integer venueId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(b) FROM Booking b " +
           "WHERE b.status = com.kstn.group4.backend.booking.entity.BookingStatus.CANCELLED " +
           "AND (:venueId IS NULL OR b.pitch.venue.id = :venueId) " +
           "AND b.bookingDate >= :startDate AND b.bookingDate <= :endDate")
    Long countCanceledBookings(
            @Param("venueId") Integer venueId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(DISTINCT b.player.id) FROM Booking b " +
           "WHERE (:venueId IS NULL OR b.pitch.venue.id = :venueId) " +
           "AND b.bookingDate >= :startDate AND b.bookingDate <= :endDate")
    Long countUniqueCustomers(
            @Param("venueId") Integer venueId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(p) FROM Pitch p " +
           "WHERE p.isActive = true " +
           "AND (:venueId IS NULL OR p.venue.id = :venueId)")
    Long countActivePitches(@Param("venueId") Integer venueId);

    @Query("SELECT b FROM Booking b " +
           "LEFT JOIN FETCH b.pitch p " +
           "LEFT JOIN FETCH b.player pl " +
           "WHERE (:venueId IS NULL OR p.venue.id = :venueId) " +
           "AND b.bookingDate >= :startDate AND b.bookingDate <= :endDate " +
           "ORDER BY b.createdAt DESC")
    List<Booking> findRecentBookings(
            @Param("venueId") Integer venueId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable);

    @Query("SELECT new com.kstn.group4.backend.statistics.dto.PitchPerformanceDto(p.id, p.name, " +
           "COUNT(b.id), " +
           "CAST(COALESCE(SUM(CASE " +
           "  WHEN b.status = com.kstn.group4.backend.booking.entity.BookingStatus.COMPLETED THEN b.totalPrice " +
           "  WHEN b.status IN (com.kstn.group4.backend.booking.entity.BookingStatus.BOOKED, " +
           "                    com.kstn.group4.backend.booking.entity.BookingStatus.CONFIRMED, " +
           "                    com.kstn.group4.backend.booking.entity.BookingStatus.PLAYING) THEN b.totalPrice * 0.5 " +
           "  ELSE 0 END), 0) AS BigDecimal)) " +
           "FROM Pitch p " +
           "LEFT JOIN Booking b ON b.pitch.id = p.id AND b.bookingDate >= :startDate AND b.bookingDate <= :endDate " +
           "WHERE (:venueId IS NULL OR p.venue.id = :venueId) " +
           "AND p.isActive = true " +
           "GROUP BY p.id, p.name " +
           "ORDER BY COUNT(b.id) DESC")
    List<PitchPerformanceDto> findPitchPerformances(
            @Param("venueId") Integer venueId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
