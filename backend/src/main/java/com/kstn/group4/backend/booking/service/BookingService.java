package com.kstn.group4.backend.booking.service;

import com.kstn.group4.backend.booking.dto.admin.AdminBookingDetailResponse;
import com.kstn.group4.backend.booking.dto.admin.AdminBookingSummaryResponse;
import com.kstn.group4.backend.booking.dto.admin.AdminUpdateBookingRequest;
import com.kstn.group4.backend.booking.dto.player.CreateBookingRequest;
import com.kstn.group4.backend.booking.dto.player.PlayerBookingResponse;
import com.kstn.group4.backend.booking.entity.Booking;
import com.kstn.group4.backend.booking.entity.BookingStatus;
import com.kstn.group4.backend.booking.repository.BookingRepository;
import com.kstn.group4.backend.exception.BusinessException;
import com.kstn.group4.backend.exception.ForbiddenException;
import com.kstn.group4.backend.exception.ResourceConflictException;
import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.user.entity.User;
import com.kstn.group4.backend.user.repository.UserRepository;
import com.kstn.group4.backend.venue.entity.Pitch;
import com.kstn.group4.backend.venue.entity.PriceRule;
import com.kstn.group4.backend.venue.entity.TimeSlot;
import com.kstn.group4.backend.venue.repository.PriceRuleRepository;
import com.kstn.group4.backend.venue.repository.TimeSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final PriceRuleRepository priceRuleRepository;
    private final TimeSlotRepository timeSlotRepository;

    // ==================== ADMIN METHODS ====================

    /**
     * Search all bookings for admin with optional filters.
     * Supports filtering by date, status, and pitchId.
     * Uses READ-ONLY transaction since no modifications are made.
     * Throws BusinessException if status parameter is invalid.
     */
    @Transactional(readOnly = true)
    public Page<AdminBookingSummaryResponse> searchAllBookingsForAdmin(
            LocalDate date,
            String status,
            Integer pitchId,
            Pageable pageable
    ) {
        BookingStatus bookingStatus = null;
        if (status != null && !status.isBlank()) {
            try {
                bookingStatus = BookingStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BusinessException(
                        "Trạng thái tìm kiếm không hợp lệ: " + status + ". Các trạng thái hợp lệ: RESERVED, CANCELLED, PLAYING",
                        "INVALID_SEARCH_STATUS"
                );
            }
        }

        Page<Booking> bookings = bookingRepository.searchByFilters(
                date,
                bookingStatus,
                pitchId,
                pageable
        );

        return bookings.map(this::toAdminSummaryResponse);
    }

    /**
     * Get detailed information about a specific booking for admin.
     * Uses findByIdWithDetails to eagerly load all nested entities.
     * Throws ResourceNotFoundException if booking is not found.
     */
    @Transactional(readOnly = true)
    public AdminBookingDetailResponse getBookingDetailForAdmin(Integer bookingId) {
        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt sân với ID: " + bookingId, "Booking"));
        return toAdminDetailResponse(booking);
    }

    /**
     * Update booking status. Accepts status as string and converts to enum.
     * Validates status before saving.
     * Throws BusinessException if status is invalid (business domain rule violation).
     */
    @Transactional
    public void updateBookingStatus(Integer bookingId, AdminUpdateBookingRequest request) {
        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt sân với ID: " + bookingId, "Booking"));

        String statusString = request.status();

        try {
            BookingStatus newStatus = BookingStatus.valueOf(statusString.toUpperCase());
            booking.setStatus(newStatus);
            bookingRepository.save(booking);
        } catch (IllegalArgumentException e) {
            throw new BusinessException(
                    "Trạng thái không hợp lệ: " + statusString + ". Các trạng thái hợp lệ: RESERVED, CANCELLED, PLAYING",
                    "INVALID_BOOKING_STATUS"
            );
        }
    }

    // ==================== MAPPER METHODS (Private) ====================

    /**
     * Map Booking entity to AdminBookingSummaryResponse DTO.
     * Handles null references safely to prevent NullPointerException.
     */
    private AdminBookingSummaryResponse toAdminSummaryResponse(Booking booking) {
        String customerName = booking.getPlayer() != null && booking.getPlayer().getUsername() != null
                ? booking.getPlayer().getUsername()
                : "N/A";

        String pitchName = booking.getPitch() != null && booking.getPitch().getName() != null
                ? booking.getPitch().getName()
                : "N/A";

        String venueName = booking.getPitch() != null
                && booking.getPitch().getVenue() != null
                && booking.getPitch().getVenue().getName() != null
                ? booking.getPitch().getVenue().getName()
                : "N/A";

        String status = booking.getStatus() != null
                ? booking.getStatus().name()
                : "N/A";

        return AdminBookingSummaryResponse.builder()
                .id(booking.getId())
                .customerName(customerName)
                .venueName(venueName)
                .pitchName(pitchName)
                .bookingDate(booking.getBookingDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .totalPrice(booking.getTotalPrice() != null ? booking.getTotalPrice() : BigDecimal.ZERO)
                .status(status)
                .build();
    }

    /**
     * Map Booking entity to AdminBookingDetailResponse DTO.
     * Handles null references and provides default values for financial fields.
     */
    private AdminBookingDetailResponse toAdminDetailResponse(Booking booking) {
        String customerName = booking.getPlayer() != null && booking.getPlayer().getUsername() != null
                ? booking.getPlayer().getUsername()
                : "N/A";

        String customerPhone = booking.getPlayer() != null && booking.getPlayer().getPhoneNumber() != null
                ? booking.getPlayer().getPhoneNumber()
                : "N/A";

        String customerEmail = booking.getPlayer() != null && booking.getPlayer().getEmail() != null
                ? booking.getPlayer().getEmail()
                : "N/A";

        String venueName = booking.getPitch() != null
                && booking.getPitch().getVenue() != null
                && booking.getPitch().getVenue().getName() != null
                ? booking.getPitch().getVenue().getName()
                : "N/A";

        String pitchName = booking.getPitch() != null && booking.getPitch().getName() != null
                ? booking.getPitch().getName()
                : "N/A";

        String status = booking.getStatus() != null
                ? booking.getStatus().name()
                : "N/A";

        BigDecimal totalPrice = booking.getTotalPrice() != null
                ? booking.getTotalPrice()
                : BigDecimal.ZERO;

        BigDecimal depositAmount = BigDecimal.ZERO;

        String adminNote = null;
        String paymentStatus = "UNPAID";

        List<AdminBookingDetailResponse.AddonServiceItem> addOns = new ArrayList<>();

        return AdminBookingDetailResponse.builder()
                .id(booking.getId())
                .venueName(venueName)
                .pitchName(pitchName)
                .bookingDate(booking.getBookingDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .status(status)
                .customerName(customerName)
                .customerPhone(customerPhone)
                .customerEmail(customerEmail)
                .totalPrice(totalPrice)
                .depositAmount(depositAmount)
                .paymentStatus(paymentStatus)
                .adminNote(adminNote)
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getCreatedAt())
                .addOns(addOns)
                .build();
    }

    // ==================== PLAYER METHODS ====================

    /**
     * Create a new booking for a player.
     * - Uses fixed 90-minute time slot system (predefined slots).
     * - Locks TimeSlot row with PESSIMISTIC_WRITE to prevent double-booking race conditions.
     * - Checks unique constraint: UNIQUE(booking_date, time_slot_id) at database level.
     * - Calculates totalPrice from PriceRule based on slot number and weekend flag.
     * - Uses RESERVED status for pending payment (50% deposit required).
     * 
     * RACE CONDITION PREVENTION:
     * - Pessimistic lock on TimeSlot ensures atomicity
     * - UNIQUE(booking_date, time_slot_id) constraint prevents duplicates at DB level
     * - Transaction isolation ensures consistency
     */
    @Transactional
    public PlayerBookingResponse createBooking(Integer playerId, CreateBookingRequest request) {
        User player = userRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + playerId, "User"));

        if (request.getBookingDate() == null) {
            throw new BusinessException("Ngày đặt sân không được để trống", "INVALID_BOOKING_DATE");
        }

        // ==================== STEP 1: Lock TimeSlot with PESSIMISTIC_WRITE ====================
        TimeSlot timeSlot = timeSlotRepository.findByIdForUpdate(request.getTimeSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ca đặt sân với ID: " + request.getTimeSlotId(), "TimeSlot"));

        // ==================== STEP 2: Get Pitch from TimeSlot and Validate ====================
        Pitch pitch = timeSlot.getPitch();
        if (pitch == null) {
            throw new BusinessException("Ca đặt sân chưa được gán vào sân", "TIMESLOT_NOT_ASSOCIATED_WITH_PITCH");
        }

        if (!pitch.getId().equals(request.getPitchId())) {
            throw new BusinessException("Ca đặt sân không thuộc sân đã chọn", "TIMESLOT_PITCH_MISMATCH");
        }

        if (pitch.getVenue() == null) {
            throw new ResourceNotFoundException("Sân chưa được gán vào cụm sân", "Venue");
        }

        // ==================== STEP 3: Validate Operating Hours ====================
        if (timeSlot.getStartTime().isBefore(pitch.getVenue().getOpenTime())
                || timeSlot.getEndTime().isAfter(pitch.getVenue().getCloseTime())) {
            throw new BusinessException("Nằm ngoài giờ mở cửa của sân", "OUT_OF_OPERATING_HOURS");
        }

        // ==================== STEP 4: Check Slot Not Already Booked (UNIQUE Constraint) ====================
        // This check is backed by UNIQUE(booking_date, time_slot_id) at DB level
        boolean alreadyBooked = bookingRepository.existsByTimeSlotIdAndBookingDate(
                request.getTimeSlotId(),
                request.getBookingDate()
        );

        if (alreadyBooked) {
            throw new ResourceConflictException("Ca đặt sân này đã được đặt. Vui lòng chọn ca khác");
        }

        // ==================== STEP 5: Lookup Pricing ====================
        boolean isWeekend = isWeekend(request.getBookingDate());
        BigDecimal totalPrice = priceRuleRepository
                .findByPitchIdAndSlotNumberAndIsWeekend(pitch.getId(), timeSlot.getSlotNumber(), isWeekend)
                .map(PriceRule::getPrice)
                .orElseThrow(() -> new BusinessException("Chưa có giá cho ca này", "PRICE_NOT_SET"));

        BigDecimal depositAmount = calculateDepositAmount(totalPrice);

        // ==================== STEP 6: Create and Save Booking ====================
        Booking booking = new Booking();
        booking.setPlayer(player);
        booking.setPitch(pitch);
        booking.setTimeSlot(timeSlot);  // NEW: Direct reference to TimeSlot
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(timeSlot.getStartTime());  // Copy for backward compatibility
        booking.setEndTime(timeSlot.getEndTime());      // Copy for backward compatibility
        booking.setStatus(BookingStatus.RESERVED);
        booking.setTotalPrice(totalPrice);

        Booking savedBooking = bookingRepository.save(booking);
        return toPlayerBookingResponse(savedBooking, depositAmount);
    }

    /**
     * Cancel a booking (for player).
     * - Only owner can cancel.
     * - Must cancel at least 24 hours before kickoff.
     * - Only RESERVED bookings can be cancelled (equivalent of PENDING/BOOKED).
     */
    @Transactional
    public void cancelBooking(Integer bookingId, Integer playerId) {
        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt sân với ID: " + bookingId, "Booking"));

        if (booking.getPlayer() == null || !booking.getPlayer().getId().equals(playerId)) {
            throw new ForbiddenException("Bạn không có quyền hủy đơn đặt sân này");
        }

        LocalDateTime matchStart = LocalDateTime.of(booking.getBookingDate(), booking.getStartTime());
        if (Duration.between(LocalDateTime.now(), matchStart).toHours() < 24) {
            throw new BusinessException("Chỉ được hủy sân trước 24 tiếng", "CANCEL_TOO_LATE");
        }

        if (booking.getStatus() != BookingStatus.RESERVED) {
            throw new BusinessException("Chỉ có thể hủy đơn ở trạng thái PENDING/BOOKED", "INVALID_CANCELLATION_STATE");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    /**
     * Get all bookings for a specific player.
     * Uses READ-ONLY transaction since no modifications are made.
     */
    @Transactional(readOnly = true)
    public Page<PlayerBookingResponse> getMyBookings(Integer playerId, Pageable pageable) {
        return bookingRepository.findByPlayerId(playerId, pageable)
                .map(this::toPlayerBookingResponse);
    }

    /**
     * Get a specific booking for a player (with ownership check).
     * Uses READ-ONLY transaction since no modifications are made.
     */
    @Transactional(readOnly = true)
    public PlayerBookingResponse getMyBooking(Integer bookingId, Integer playerId) {
        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt sân với ID: " + bookingId, "Booking"));

        if (booking.getPlayer() == null || !booking.getPlayer().getId().equals(playerId)) {
            throw new ForbiddenException("Bạn không có quyền truy cập đơn đặt sân này");
        }

        return toPlayerBookingResponse(booking);
    }

    private PlayerBookingResponse toPlayerBookingResponse(Booking booking) {
        BigDecimal totalPrice = booking.getTotalPrice() != null ? booking.getTotalPrice() : BigDecimal.ZERO;
        BigDecimal depositAmount = calculateDepositAmount(totalPrice);
        return toPlayerBookingResponse(booking, depositAmount);
    }

    private PlayerBookingResponse toPlayerBookingResponse(Booking booking, BigDecimal depositAmount) {
        String pitchName = booking.getPitch() != null && booking.getPitch().getName() != null
                ? booking.getPitch().getName()
                : "N/A";

        String status = booking.getStatus() != null ? booking.getStatus().name() : "N/A";
        BigDecimal totalPrice = booking.getTotalPrice() != null ? booking.getTotalPrice() : BigDecimal.ZERO;

        return new PlayerBookingResponse(
                booking.getId(),
                booking.getPitch() != null ? booking.getPitch().getId() : null,
                pitchName,
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                totalPrice,
                depositAmount,
                status
        );
    }

    private boolean isWeekend(LocalDate date) {
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        return dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY;
    }

    private BigDecimal calculateDepositAmount(BigDecimal totalPrice) {
        return totalPrice.multiply(BigDecimal.valueOf(0.5)).setScale(2, RoundingMode.HALF_UP);
    }
}
