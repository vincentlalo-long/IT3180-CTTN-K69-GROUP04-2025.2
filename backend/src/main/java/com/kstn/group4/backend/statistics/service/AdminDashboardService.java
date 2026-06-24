package com.kstn.group4.backend.statistics.service;

import com.kstn.group4.backend.booking.entity.Booking;
import com.kstn.group4.backend.statistics.dto.DashboardStatsResponse;
import com.kstn.group4.backend.statistics.dto.PitchPerformanceDto;
import com.kstn.group4.backend.statistics.dto.RecentOrderDto;
import com.kstn.group4.backend.statistics.repository.StatisticsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final StatisticsRepository statisticsRepository;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(String facilityId, String timeRange, String startDateStr, String endDateStr) {
        Integer venueId = parseFacilityId(facilityId);
        LocalDate[] dates = resolveDates(timeRange, startDateStr, endDateStr);
        LocalDate startDate = dates[0];
        LocalDate endDate = dates[1];

        BigDecimal totalRevenue = statisticsRepository.calculateTotalRevenue(venueId, startDate, endDate);
        Long totalBookings = statisticsRepository.countTotalBookings(venueId, startDate, endDate);
        Long canceledBookings = statisticsRepository.countCanceledBookings(venueId, startDate, endDate);
        Long uniqueCustomers = statisticsRepository.countUniqueCustomers(venueId, startDate, endDate);
        Long activeFields = statisticsRepository.countActivePitches(venueId);

        // Tính toán Occupancy Rate
        long days = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        double occupancyRate = 0.0;
        if (activeFields > 0 && days > 0) {
            long activeBookings = totalBookings - canceledBookings;
            occupancyRate = ((double) activeBookings / (days * activeFields * 11)) * 100;
            // Round to 1 decimal place
            occupancyRate = Math.round(occupancyRate * 10.0) / 10.0;
        }

        List<PitchPerformanceDto> pitchPerformances = statisticsRepository.findPitchPerformances(venueId, startDate, endDate);

        return DashboardStatsResponse.builder()
                .totalRevenue(totalRevenue)
                .totalBookings(totalBookings)
                .canceledBookings(canceledBookings)
                .uniqueCustomers(uniqueCustomers)
                .occupancyRate(occupancyRate)
                .pitchPerformances(pitchPerformances)
                .build();
    }

    @Transactional(readOnly = true)
    public List<RecentOrderDto> getRecentOrders(String facilityId, String timeRange, String startDateStr, String endDateStr) {
        Integer venueId = parseFacilityId(facilityId);
        LocalDate[] dates = resolveDates(timeRange, startDateStr, endDateStr);
        LocalDate startDate = dates[0];
        LocalDate endDate = dates[1];

        List<Booking> bookings = statisticsRepository.findRecentBookings(venueId, startDate, endDate, PageRequest.of(0, 5));

        return bookings.stream()
                .map(booking -> {
                    String customerName = booking.getPlayer() != null ? booking.getPlayer().getUsername() : "N/A";
                    String fieldName = booking.getPitch() != null ? booking.getPitch().getName() : "N/A";
                    
                    String dateStr = booking.getBookingDate() != null ? booking.getBookingDate().format(DATE_FORMATTER) : "N/A";
                    String timeStr = booking.getStartTime() != null ? booking.getStartTime().toString().substring(0, 5) : "";
                    String bookingTime = dateStr + (timeStr.isEmpty() ? "" : " " + timeStr);

                    return RecentOrderDto.builder()
                            .id(String.valueOf(booking.getId()))
                            .customerName(customerName)
                            .fieldName(fieldName)
                            .bookingTime(bookingTime)
                            .price(booking.getTotalPrice() != null ? booking.getTotalPrice() : BigDecimal.ZERO)
                            .status(booking.getStatus() != null ? booking.getStatus().name() : "N/A")
                            .build();
                })
                .collect(Collectors.toList());
    }

    private Integer parseFacilityId(String facilityId) {
        if (facilityId == null || facilityId.trim().isEmpty() || "ALL".equalsIgnoreCase(facilityId)) {
            return null;
        }
        try {
            return Integer.parseInt(facilityId.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private LocalDate[] resolveDates(String timeRange, String startDateStr, String endDateStr) {
        LocalDate today = LocalDate.now();
        LocalDate startDate;
        LocalDate endDate;

        if ("WEEK".equalsIgnoreCase(timeRange)) {
            startDate = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            endDate = today;
        } else if ("MONTH".equalsIgnoreCase(timeRange)) {
            startDate = today.with(TemporalAdjusters.firstDayOfMonth());
            endDate = today;
        } else if ("CUSTOM".equalsIgnoreCase(timeRange)) {
            try {
                startDate = (startDateStr != null && !startDateStr.trim().isEmpty())
                        ? LocalDate.parse(startDateStr.trim())
                        : today;
            } catch (Exception e) {
                startDate = today;
            }
            try {
                endDate = (endDateStr != null && !endDateStr.trim().isEmpty())
                        ? LocalDate.parse(endDateStr.trim())
                        : today;
            } catch (Exception e) {
                endDate = today;
            }
        } else {
            // Default to TODAY
            startDate = today;
            endDate = today;
        }

        // Ensure chronological order
        if (startDate.isAfter(endDate)) {
            LocalDate temp = startDate;
            startDate = endDate;
            endDate = temp;
        }

        return new LocalDate[]{startDate, endDate};
    }
}
