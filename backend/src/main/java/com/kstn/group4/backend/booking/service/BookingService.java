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
import com.kstn.group4.backend.venue.repository.PitchRepository;
import com.kstn.group4.backend.venue.repository.PriceRuleRepository;
import com.kstn.group4.backend.venue.repository.TimeSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingService {

    private static final Logger LOGGER = LoggerFactory.getLogger(BookingService.class);

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final PitchRepository pitchRepository;
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
            
            // Handle pricing logic on cancellation
            if (newStatus == BookingStatus.CANCELLED && booking.getStatus() != BookingStatus.CANCELLED) {
                if (booking.getPricingMode() != com.kstn.group4.backend.booking.entity.PricingMode.MANUAL) {
                    BigDecimal deposit = calculateDepositAmount(booking.getTotalPrice() != null ? booking.getTotalPrice() : BigDecimal.ZERO);
                    booking.setTotalPrice(deposit);
                }
            }
            
            booking.setStatus(newStatus);
            bookingRepository.save(booking);
        } catch (IllegalArgumentException e) {
            throw new BusinessException(
                    "Trạng thái không hợp lệ: " + statusString + ". Các trạng thái hợp lệ: RESERVED, CANCELLED, PLAYING",
                    "INVALID_BOOKING_STATUS"
            );
        }
    }

    /**
     * Override booking price by admin.
     * Changes pricing mode to MANUAL so future automatic recalculations ignore it.
     */
    @Transactional
    public void overrideBookingPrice(Integer bookingId, BigDecimal newPrice) {
        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt sân với ID: " + bookingId, "Booking"));

        booking.setTotalPrice(newPrice);
        booking.setPricingMode(com.kstn.group4.backend.booking.entity.PricingMode.MANUAL);
        bookingRepository.save(booking);
    }

    // ==================== MAPPER METHODS (Private) ====================

    /**
     * Map Booking entity to AdminBookingSummaryResponse DTO.
     * Handles null references safely to prevent NullPointerException.
     * Calculates depositAmount as 50% of totalPrice.
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

        String customerPhone = booking.getPlayer() != null && booking.getPlayer().getPhoneNumber() != null
                ? booking.getPlayer().getPhoneNumber()
                : "N/A";

        String status = booking.getStatus() != null
                ? booking.getStatus().name()
                : "N/A";

        BigDecimal totalPrice = booking.getTotalPrice() != null ? booking.getTotalPrice() : BigDecimal.ZERO;
        BigDecimal depositAmount = totalPrice.divide(new BigDecimal("2"), RoundingMode.HALF_UP);

        return AdminBookingSummaryResponse.builder()
                .id(booking.getId())
                .customerName(customerName)
                .customerPhone(customerPhone)
                .venueName(venueName)
                .pitchName(pitchName)
                .bookingDate(booking.getBookingDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .depositAmount(depositAmount)
                .totalPrice(totalPrice)
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
     *
     * STRATEGY (post-normalization):
     * - TimeSlot is now global master data (11 rows, ID = slotNumber).
     * - Pitch is fetched directly by pitchId from the request.
     * - Lock on PITCH (PESSIMISTIC_WRITE) to prevent concurrent bookings on the same pitch.
     * - Double-booking backed by UNIQUE(booking_date, pitch_id, time_slot_id) at DB level.
     *
     * RACE CONDITION PREVENTION:
     * - Pessimistic lock on Pitch serializes bookings for the same pitch.
     * - UNIQUE constraint at DB level is the ultimate safety net.
     */
    @Transactional
    public PlayerBookingResponse createBooking(Integer playerId, CreateBookingRequest request) {
        User player = userRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + playerId, "User"));

        if (request.getBookingDate() == null) {
            throw new BusinessException("Ngày đặt sân không được để trống", "INVALID_BOOKING_DATE");
        }

        // ==================== STEP 1: Lock Pitch with PESSIMISTIC_WRITE ====================
        Pitch pitch = pitchRepository.findByIdForUpdate(request.getPitchId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sân với ID: " + request.getPitchId(), "Pitch"));

        if (pitch.getVenue() == null) {
            throw new ResourceNotFoundException("Sân chưa được gán vào cụm sân", "Venue");
        }

        // ==================== STEP 2: Fetch Global TimeSlot ====================
        TimeSlot timeSlot = timeSlotRepository.findById(request.getTimeSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ca đặt sân với ID: " + request.getTimeSlotId(), "TimeSlot"));

        // ==================== STEP 3: Validate Operating Hours ====================
        if (timeSlot.getStartTime().isBefore(pitch.getVenue().getOpenTime())
                || timeSlot.getEndTime().isAfter(pitch.getVenue().getCloseTime())) {
            throw new BusinessException("Nằm ngoài giờ mở cửa của sân", "OUT_OF_OPERATING_HOURS");
        }

        // ==================== STEP 4: Check Slot Not Already Booked ====================
        // Backed by UNIQUE(booking_date, pitch_id, time_slot_id) at DB level
        boolean alreadyBooked = bookingRepository.existsByPitchIdAndTimeSlotIdAndBookingDate(
                pitch.getId(),
                request.getTimeSlotId(),
                request.getBookingDate()
        );

        if (alreadyBooked) {
            LOGGER.warn(
                    "BOOKING_RACE status=FAILED reason=ALREADY_BOOKED playerId={} pitchId={} timeSlotId={} bookingDate={}",
                    playerId,
                    request.getPitchId(),
                    request.getTimeSlotId(),
                    request.getBookingDate()
            );
            throw new ResourceConflictException("Ca đặt sân này đã được đặt. Vui lòng chọn ca khác");
        }

        // ==================== STEP 5: Lookup Pricing ====================
        boolean isWeekend = isWeekend(request.getBookingDate());
        
        // Golden hours: 17:00 to 22:00
        LocalTime startTime = timeSlot.getStartTime();
        boolean isGoldenHour = !startTime.isBefore(LocalTime.of(17, 0)) && startTime.isBefore(LocalTime.of(22, 0));
        
        BigDecimal coefficient = priceRuleRepository
                .findByPitchIdAndSlotNumberAndIsWeekend(pitch.getId(), timeSlot.getSlotNumber(), isWeekend)
                .map(PriceRule::getCoefficient)
                .orElseGet(() -> {
                    BigDecimal coeff = BigDecimal.ONE;
                    if (isWeekend) coeff = coeff.add(new BigDecimal("0.2"));
                    if (isGoldenHour) coeff = coeff.add(new BigDecimal("0.3"));
                    return coeff;
                });
        
        if (pitch.getBasePrice() == null) {
            throw new BusinessException("Chưa có giá cơ bản cho sân này", "BASE_PRICE_NOT_SET");
        }
        BigDecimal totalPrice = pitch.getBasePrice().multiply(coefficient).setScale(2, RoundingMode.HALF_UP);

        BigDecimal depositAmount = calculateDepositAmount(totalPrice);

        // ==================== STEP 6: Create and Save Booking ====================
        Booking booking = new Booking();
        booking.setPlayer(player);
        booking.setPitch(pitch);
        booking.setTimeSlot(timeSlot);
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(timeSlot.getStartTime());
        booking.setEndTime(timeSlot.getEndTime());
        booking.setStatus(BookingStatus.RESERVED);
        booking.setTotalPrice(totalPrice);

        try {
            Booking savedBooking = bookingRepository.save(booking);
            return toPlayerBookingResponse(savedBooking, depositAmount);
        } catch (DataIntegrityViolationException ex) {
            LOGGER.warn(
                    "BOOKING_RACE status=FAILED reason=UNIQUE_CONSTRAINT playerId={} pitchId={} timeSlotId={} bookingDate={}",
                    playerId,
                    request.getPitchId(),
                    request.getTimeSlotId(),
                    request.getBookingDate()
            );
            throw new ResourceConflictException("Ca đặt sân này đã được đặt. Vui lòng chọn ca khác");
        }
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

        if (booking.getPricingMode() != com.kstn.group4.backend.booking.entity.PricingMode.MANUAL) {
            BigDecimal deposit = calculateDepositAmount(booking.getTotalPrice() != null ? booking.getTotalPrice() : BigDecimal.ZERO);
            booking.setTotalPrice(deposit);
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

    @Transactional
    public Booking createMatchAutoBooking(Integer playerId, Integer pitchId, Integer timeSlotId, LocalDate bookingDate) {
        User player = userRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng", "User"));
        Pitch pitch = pitchRepository.findByIdForUpdate(pitchId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sân", "Pitch"));
        TimeSlot timeSlot = timeSlotRepository.findById(timeSlotId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ca", "TimeSlot"));

        // Tận dụng logic tính toán hệ số giá (Weekend, Golden Hour) có sẵn
        boolean isWeekend = isWeekend(bookingDate);
        LocalTime startTime = timeSlot.getStartTime();
        boolean isGoldenHour = !startTime.isBefore(LocalTime.of(17, 0)) && startTime.isBefore(LocalTime.of(22, 0));
        
        BigDecimal coefficient = priceRuleRepository
                .findByPitchIdAndSlotNumberAndIsWeekend(pitch.getId(), timeSlot.getSlotNumber(), isWeekend)
                .map(PriceRule::getCoefficient)
                .orElseGet(() -> {
                    BigDecimal coeff = BigDecimal.ONE;
                    if (isWeekend) coeff = coeff.add(new BigDecimal("0.2"));
                    if (isGoldenHour) coeff = coeff.add(new BigDecimal("0.3"));
                    return coeff;
                });

        BigDecimal totalPrice = pitch.getBasePrice().multiply(coefficient).setScale(2, RoundingMode.HALF_UP);

        Booking booking = new Booking();
        booking.setPlayer(player);
        booking.setPitch(pitch);
        booking.setTimeSlot(timeSlot);
        booking.setBookingDate(bookingDate);
        booking.setStartTime(timeSlot.getStartTime());
        booking.setEndTime(timeSlot.getEndTime());
        booking.setStatus(BookingStatus.CONFIRMED); // Ép trạng thái CONFIRMED (luồng mock)
        booking.setBookingType("MATCH_AUTO");
        booking.setTotalPrice(totalPrice); // Lưu đúng tổng tiền tính được từ CSDL!

        return bookingRepository.save(booking);
    }
}
