package com.kstn.group4.backend.service.manager;

import com.kstn.group4.backend.dto.manager.DashboardStatsResponse;
import com.kstn.group4.backend.dto.manager.RecentOrderDto;
import com.kstn.group4.backend.entity.Booking;
import com.kstn.group4.backend.entity.Pitch;
import com.kstn.group4.backend.exception.BadRequestException;
import com.kstn.group4.backend.repository.BookingRepository;
import com.kstn.group4.backend.repository.PitchRepository;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ManagerDashboardService {

    private static final String ALL_FACILITY = "ALL";
    private static final List<String> ACTIVE_PITCH_STATUSES = List.of("ACTIVE", "APPROVED");
    private static final int RECENT_BOOKINGS_LIMIT = 10;

    private final BookingRepository bookingRepository;
    private final PitchRepository pitchRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(String facilityId, Long currentManagerId) {
        Integer managerId = toManagerId(currentManagerId);

        if (isAllFacilities(facilityId)) {
            List<Integer> ownedPitchIds = pitchRepository.findByManagerId(managerId).stream()
                    .map(Pitch::getId)
                    .toList();

                int activeFields = pitchRepository.countActiveByManagerId(managerId, ACTIVE_PITCH_STATUSES);

            if (ownedPitchIds.isEmpty()) {
                return buildStatsResponse(BigDecimal.ZERO, 0L, 0L, activeFields);
            }

            BigDecimal totalRevenue = bookingRepository.sumRevenueByManagerAndPitchIds(managerId, ownedPitchIds);
            long totalBookings = bookingRepository.countBookingsByManagerAndPitchIds(managerId, ownedPitchIds);
            long uniqueCustomers = bookingRepository.countUniqueCustomersByManagerAndPitchIds(managerId, ownedPitchIds);

            return buildStatsResponse(totalRevenue, totalBookings, uniqueCustomers, activeFields);
        }

        Integer pitchId = toPitchId(facilityId);
        BigDecimal totalRevenue = bookingRepository.sumRevenueByManagerAndPitchId(managerId, pitchId);
        long totalBookings = bookingRepository.countBookingsByManagerAndPitchId(managerId, pitchId);
        long uniqueCustomers = bookingRepository.countUniqueCustomersByManagerAndPitchId(managerId, pitchId);
        int activeFields = pitchRepository.countActiveByIdAndManagerId(pitchId, managerId, ACTIVE_PITCH_STATUSES);

        return buildStatsResponse(totalRevenue, totalBookings, uniqueCustomers, activeFields);
    }

    @Transactional(readOnly = true)
    public List<RecentOrderDto> getRecentOrders(String facilityId, Long currentManagerId) {
        Integer managerId = toManagerId(currentManagerId);
        List<Booking> bookings;

        if (isAllFacilities(facilityId)) {
            bookings = bookingRepository.findRecentBookingsByManagerId(
                    managerId,
                    PageRequest.of(0, RECENT_BOOKINGS_LIMIT)
            );
        } else {
            Integer pitchId = toPitchId(facilityId);
            bookings = bookingRepository.findRecentBookingsByManagerIdAndPitchId(
                    managerId,
                    pitchId,
                    PageRequest.of(0, RECENT_BOOKINGS_LIMIT)
            );
        }

        if (bookings.isEmpty()) {
            return Collections.emptyList();
        }

        return bookings.stream()
                .map(this::toRecentOrderDto)
                .toList();
    }

    private DashboardStatsResponse buildStatsResponse(BigDecimal totalRevenue,
                                                      long totalBookings,
                                                      long uniqueCustomers,
                                                      int activeFields) {
        return DashboardStatsResponse.builder()
                .totalRevenue(totalRevenue == null ? 0D : totalRevenue.doubleValue())
                .totalBookings((int) totalBookings)
                .uniqueCustomers((int) uniqueCustomers)
                .vacancyRate(calculateVacancyRate(totalBookings, activeFields))
                .activeFields(activeFields)
                .build();
    }

    private RecentOrderDto toRecentOrderDto(Booking booking) {
        return RecentOrderDto.builder()
                .id(booking.getId() == null ? null : booking.getId().longValue())
                .customerName(booking.getPlayer() == null ? "Unknown" : booking.getPlayer().getUsername())
                .fieldName(booking.getPitch() == null ? "Unknown" : booking.getPitch().getName())
                .bookingTime(booking.getCreatedAt())
                .price(booking.getTotalPrice() == null ? 0D : booking.getTotalPrice().doubleValue())
                .status(booking.getStatus())
                .build();
    }

    private boolean isAllFacilities(String facilityId) {
        return facilityId == null || facilityId.isBlank() || ALL_FACILITY.equalsIgnoreCase(facilityId);
    }

    private Integer toManagerId(Long currentManagerId) {
        if (currentManagerId == null) {
            throw new BadRequestException("Thiếu managerId");
        }

        return Math.toIntExact(currentManagerId);
    }

    private Integer toPitchId(String facilityId) {
        try {
            return Integer.valueOf(facilityId);
        } catch (NumberFormatException exception) {
            throw new BadRequestException("facilityId không hợp lệ: " + facilityId);
        }
    }

    private String calculateVacancyRate(long totalBookings, int activeFields) {
        if (activeFields <= 0) {
            return "0%";
        }

        double totalCapacity = activeFields * 10D;
        double vacancyRate = Math.max(0D, ((totalCapacity - totalBookings) / totalCapacity) * 100D);
        return String.format(Locale.US, "%.1f%%", vacancyRate);
    }
}


