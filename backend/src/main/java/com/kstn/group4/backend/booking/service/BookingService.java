package com.kstn.group4.backend.booking.service;

import com.kstn.group4.backend.booking.dto.admin.AdminBookingDetailResponse;
import com.kstn.group4.backend.booking.dto.admin.AdminBookingSummaryResponse;
import com.kstn.group4.backend.booking.dto.admin.AdminUpdateBookingRequest;
import com.kstn.group4.backend.booking.dto.player.CreateBookingRequest;
import com.kstn.group4.backend.booking.dto.player.PlayerBookingResponse;
import com.kstn.group4.backend.booking.dto.player.RecurringBookingRequest;
import com.kstn.group4.backend.booking.dto.player.RecurringBookingResponse;
import com.kstn.group4.backend.booking.entity.Booking;
import com.kstn.group4.backend.booking.entity.BookingServiceItem;
import com.kstn.group4.backend.booking.entity.BookingStatus;
import com.kstn.group4.backend.booking.repository.BookingRepository;
import com.kstn.group4.backend.booking.repository.BookingServiceItemRepository;
import com.kstn.group4.backend.exception.BusinessException;
import com.kstn.group4.backend.exception.ForbiddenException;
import com.kstn.group4.backend.exception.ResourceConflictException;
import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.notification.event.BookingStatusChangedEvent;
import com.kstn.group4.backend.user.entity.User;
import com.kstn.group4.backend.user.repository.UserRepository;
import com.kstn.group4.backend.venue.entity.AddonService;
import com.kstn.group4.backend.venue.entity.Pitch;
import com.kstn.group4.backend.venue.entity.PriceRule;
import com.kstn.group4.backend.venue.entity.TimeSlot;
import com.kstn.group4.backend.venue.repository.AddonServiceRepository;
import com.kstn.group4.backend.venue.repository.PitchRepository;
import com.kstn.group4.backend.venue.repository.PitchReviewRepository;
import com.kstn.group4.backend.venue.repository.PriceRuleRepository;
import com.kstn.group4.backend.venue.repository.TimeSlotRepository;
import com.kstn.group4.backend.activitylog.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
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
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingService {

    private static final Logger LOGGER = LoggerFactory.getLogger(BookingService.class);

    private final BookingRepository bookingRepository;
    private final BookingServiceItemRepository bookingServiceItemRepository;
    private final UserRepository userRepository;
    private final PitchRepository pitchRepository;
    private final PitchReviewRepository pitchReviewRepository;
    private final PriceRuleRepository priceRuleRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final AddonServiceRepository addonServiceRepository;
    private final ActivityLogService activityLogService;
    private final ApplicationEventPublisher eventPublisher;

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
            Integer venueId,
            Pageable pageable
    ) {
        BookingStatus bookingStatus = null;
        if (status != null && !status.isBlank()) {
            try {
                bookingStatus = BookingStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BusinessException(
                        "Trạng thái tìm kiếm không hợp lệ: " + status + ". Các trạng thái hợp lệ: " + java.util.Arrays.toString(BookingStatus.values()),
                        "INVALID_SEARCH_STATUS"
                );
            }
        }

        Page<Booking> bookings = bookingRepository.searchByFilters(
                date,
                bookingStatus,
                venueId,
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
            BookingStatus oldStatus = booking.getStatus();
            
            // Handle pricing logic on cancellation
            if (newStatus == BookingStatus.CANCELLED && oldStatus != BookingStatus.CANCELLED) {
                if (booking.getPricingMode() != com.kstn.group4.backend.booking.entity.PricingMode.MANUAL) {
                    BigDecimal deposit = calculateDepositAmount(booking.getTotalPrice() != null ? booking.getTotalPrice() : BigDecimal.ZERO);
                    booking.setTotalPrice(deposit);
                }
                
                org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                Integer adminId = null;
                String adminName = "System";
                if (auth != null && auth.getPrincipal() instanceof com.kstn.group4.backend.config.security.services.UserPrincipal principal) {
                    adminId = principal.getId();
                    adminName = principal.getAppUsername();
                }
                activityLogService.log(adminId, adminName, "CANCEL_BOOKING", "BOOKING", bookingId.toString(), "Hủy đơn đặt sân", null, null);
            }
            // Log confirm booking
            if (newStatus == BookingStatus.BOOKED && oldStatus != BookingStatus.BOOKED) {
                org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                Integer adminId = null;
                String adminName = "System";
                if (auth != null && auth.getPrincipal() instanceof com.kstn.group4.backend.config.security.services.UserPrincipal principal) {
                    adminId = principal.getId();
                    adminName = principal.getAppUsername();
                }
                activityLogService.log(adminId, adminName, "CONFIRM_BOOKING", "BOOKING", bookingId.toString(), "Duyệt đơn đặt sân", null, null);
            }
            
            booking.setStatus(newStatus);
            bookingRepository.save(booking);
            publishBookingStatusChanged(booking, oldStatus, newStatus);
        } catch (IllegalArgumentException e) {
            throw new BusinessException(
                    "Trạng thái không hợp lệ: " + statusString + ". Các trạng thái hợp lệ: " + java.util.Arrays.toString(BookingStatus.values()),
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
        BigDecimal depositAmount = calculateDepositAmount(totalPrice);

        if ((booking.getStatus() == BookingStatus.RESERVED || booking.getStatus() == BookingStatus.PENDING)
                && booking.getPointsRedeemedAt() == null) {
            status = "PENDING_PAYMENT";
            depositAmount = BigDecimal.ZERO;
        } else if (booking.getStatus() == BookingStatus.CANCELLED && booking.getPointsRedeemedAt() == null) {
            depositAmount = BigDecimal.ZERO;
        }

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
        String paymentStatus = "UNPAID";

        if ((booking.getStatus() == BookingStatus.RESERVED || booking.getStatus() == BookingStatus.PENDING)
                && booking.getPointsRedeemedAt() == null) {
            status = "PENDING_PAYMENT";
        } else if (booking.getPointsRedeemedAt() != null || 
                   booking.getStatus() == BookingStatus.BOOKED || 
                   booking.getStatus() == BookingStatus.CONFIRMED ||
                   booking.getStatus() == BookingStatus.PLAYING || 
                   booking.getStatus() == BookingStatus.COMPLETED) {
            depositAmount = calculateDepositAmount(totalPrice);
            paymentStatus = "PARTIAL";
        }

        String adminNote = null;

        List<AdminBookingDetailResponse.AddonServiceItem> addOns = bookingServiceItemRepository.findByBookingId(booking.getId()).stream()
                .map(item -> new AdminBookingDetailResponse.AddonServiceItem(
                        item.getService() != null ? item.getService().getName() : "N/A",
                        item.getQuantity(),
                        item.getPriceAtBooking()
                ))
                .toList();

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
        
        BigDecimal fieldPrice = pitch.getBasePrice().multiply(coefficient).setScale(2, RoundingMode.HALF_UP);

        List<BookingServiceItem> serviceItems = buildServiceItems(request, pitch);
        BigDecimal servicesTotal = serviceItems.stream()
                .map(item -> item.getPriceAtBooking().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalPrice = fieldPrice.add(servicesTotal);

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
            for (BookingServiceItem serviceItem : serviceItems) {
                serviceItem.setBooking(savedBooking);
            }
            bookingServiceItemRepository.saveAll(serviceItems);

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

    @Transactional
    public RecurringBookingResponse createRecurringBooking(Integer playerId, RecurringBookingRequest request) {
        User player = userRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + playerId, "User"));

        List<LocalDate> targetDates = generateRecurringDates(request);

        Pitch pitch = pitchRepository.findByIdForUpdate(request.getPitchId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sân với ID: " + request.getPitchId(), "Pitch"));

        if (pitch.getVenue() == null) {
            throw new ResourceNotFoundException("Sân chưa được gán vào cụm sân", "Venue");
        }

        TimeSlot timeSlot = timeSlotRepository.findById(request.getTimeSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ca đặt sân với ID: " + request.getTimeSlotId(), "TimeSlot"));

        if (timeSlot.getStartTime().isBefore(pitch.getVenue().getOpenTime())
                || timeSlot.getEndTime().isAfter(pitch.getVenue().getCloseTime())) {
            throw new BusinessException("Nằm ngoài giờ mở cửa của sân", "OUT_OF_OPERATING_HOURS");
        }

        if (pitch.getBasePrice() == null) {
            throw new BusinessException("Chưa có giá cơ bản cho sân này", "BASE_PRICE_NOT_SET");
        }

        List<RecurringBookingResponse.SkippedOccurrence> skippedOccurrences = new ArrayList<>();
        List<LocalDate> availableDates = new ArrayList<>();

        for (LocalDate targetDate : targetDates) {
            boolean alreadyBooked = bookingRepository.existsByPitchIdAndTimeSlotIdAndBookingDate(
                    pitch.getId(),
                    timeSlot.getId(),
                    targetDate
            );

            if (alreadyBooked) {
                skippedOccurrences.add(toSkippedOccurrence(pitch, timeSlot, targetDate));
            } else {
                availableDates.add(targetDate);
            }
        }

        boolean skipConflicts = request.getSkipConflicts() == null || request.getSkipConflicts();
        if (!skippedOccurrences.isEmpty() && !skipConflicts) {
            return buildRecurringResponse(
                    targetDates.size(),
                    List.of(),
                    skippedOccurrences,
                    "Có lịch bị trùng. Không tạo booking nào trong chuỗi định kỳ."
            );
        }

        List<PlayerBookingResponse> createdBookings = new ArrayList<>();
        for (LocalDate targetDate : availableDates) {
            try {
                createdBookings.add(createBookingForDate(
                        playerId,
                        player,
                        pitch,
                        timeSlot,
                        targetDate,
                        request.getServices()
                ));
            } catch (ResourceConflictException ex) {
                skippedOccurrences.add(toSkippedOccurrence(pitch, timeSlot, targetDate));
            }
        }

        String message;
        if (createdBookings.isEmpty() && !skippedOccurrences.isEmpty()) {
            message = "Không tạo booking nào vì tất cả ngày đã bị trùng lịch.";
        } else if (!skippedOccurrences.isEmpty()) {
            message = "Đã tạo " + createdBookings.size() + " booking, bỏ qua "
                    + skippedOccurrences.size() + " ngày bị trùng lịch.";
        } else {
            message = "Đã tạo " + createdBookings.size() + " booking định kỳ.";
        }

        return buildRecurringResponse(
                targetDates.size(),
                createdBookings,
                skippedOccurrences,
                message
        );
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

        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
        publishBookingStatusChanged(booking, oldStatus, BookingStatus.CANCELLED);
    }

    @Transactional
    public void cancelUnpaidBooking(Integer bookingId, Integer playerId) {
        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt sân với ID: " + bookingId, "Booking"));

        if (booking.getPlayer() == null || !booking.getPlayer().getId().equals(playerId)) {
            throw new ForbiddenException("Bạn không có quyền hủy đơn đặt sân này");
        }

        if (booking.getStatus() == BookingStatus.RESERVED && booking.getPointsRedeemedAt() == null) {
            BookingStatus oldStatus = booking.getStatus();
            booking.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);
            publishBookingStatusChanged(booking, oldStatus, BookingStatus.CANCELLED);
        }
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
        if ((booking.getStatus() == BookingStatus.RESERVED || booking.getStatus() == BookingStatus.PENDING)
                && booking.getPointsRedeemedAt() == null) {
            depositAmount = BigDecimal.ZERO;
        } else if (booking.getStatus() == BookingStatus.CANCELLED && booking.getPointsRedeemedAt() == null) {
            depositAmount = BigDecimal.ZERO;
        }
        return toPlayerBookingResponse(booking, depositAmount);
    }

    private PlayerBookingResponse toPlayerBookingResponse(Booking booking, BigDecimal depositAmount) {
        String pitchName = booking.getPitch() != null && booking.getPitch().getName() != null
                ? booking.getPitch().getName()
                : "N/A";

        String status = booking.getStatus() != null ? booking.getStatus().name() : "N/A";
        if ((booking.getStatus() == BookingStatus.RESERVED || booking.getStatus() == BookingStatus.PENDING)
                && booking.getPointsRedeemedAt() == null) {
            status = "PENDING_PAYMENT";
        }
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
                status,
                booking.getId() != null && pitchReviewRepository.existsByBookingId(booking.getId())
        );
    }

    private PlayerBookingResponse createBookingForDate(
            Integer playerId,
            User player,
            Pitch pitch,
            TimeSlot timeSlot,
            LocalDate bookingDate,
            List<CreateBookingRequest.ServiceRequest> services
    ) {
        boolean alreadyBooked = bookingRepository.existsByPitchIdAndTimeSlotIdAndBookingDate(
                pitch.getId(),
                timeSlot.getId(),
                bookingDate
        );

        if (alreadyBooked) {
            LOGGER.warn(
                    "BOOKING_RACE status=FAILED reason=ALREADY_BOOKED playerId={} pitchId={} timeSlotId={} bookingDate={}",
                    playerId,
                    pitch.getId(),
                    timeSlot.getId(),
                    bookingDate
            );
            throw new ResourceConflictException("Ca đặt sân này đã được đặt. Vui lòng chọn ca khác");
        }

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

        BigDecimal fieldPrice = pitch.getBasePrice().multiply(coefficient).setScale(2, RoundingMode.HALF_UP);
        List<BookingServiceItem> serviceItems = buildServiceItems(services, pitch);
        BigDecimal servicesTotal = serviceItems.stream()
                .map(item -> item.getPriceAtBooking().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalPrice = fieldPrice.add(servicesTotal);
        BigDecimal depositAmount = calculateDepositAmount(totalPrice);

        Booking booking = new Booking();
        booking.setPlayer(player);
        booking.setPitch(pitch);
        booking.setTimeSlot(timeSlot);
        booking.setBookingDate(bookingDate);
        booking.setStartTime(timeSlot.getStartTime());
        booking.setEndTime(timeSlot.getEndTime());
        booking.setStatus(BookingStatus.RESERVED);
        booking.setTotalPrice(totalPrice);

        try {
            Booking savedBooking = bookingRepository.save(booking);
            for (BookingServiceItem serviceItem : serviceItems) {
                serviceItem.setBooking(savedBooking);
            }
            bookingServiceItemRepository.saveAll(serviceItems);

            return toPlayerBookingResponse(savedBooking, depositAmount);
        } catch (DataIntegrityViolationException ex) {
            LOGGER.warn(
                    "BOOKING_RACE status=FAILED reason=UNIQUE_CONSTRAINT playerId={} pitchId={} timeSlotId={} bookingDate={}",
                    playerId,
                    pitch.getId(),
                    timeSlot.getId(),
                    bookingDate
            );
            throw new ResourceConflictException("Ca đặt sân này đã được đặt. Vui lòng chọn ca khác");
        }
    }

    private List<LocalDate> generateRecurringDates(RecurringBookingRequest request) {
        if (request.getStartDate() == null) {
            throw new BusinessException("Ngày bắt đầu không được để trống", "INVALID_RECURRING_START_DATE");
        }

        RecurringBookingRequest.RecurrenceType recurrenceType = request.getRecurrenceType() != null
                ? request.getRecurrenceType()
                : RecurringBookingRequest.RecurrenceType.WEEKLY;

        List<LocalDate> dates = switch (recurrenceType) {
            case WEEKLY -> generateWeeklyRecurringDates(request);
            case MONTHLY -> generateMonthlyRecurringDates(request);
        };

        if (dates.isEmpty()) {
            throw new BusinessException("Không có ngày đặt sân nào phù hợp với cấu hình lặp lại", "EMPTY_RECURRING_DATES");
        }

        return new ArrayList<>(new LinkedHashSet<>(dates));
    }

    private List<LocalDate> generateWeeklyRecurringDates(RecurringBookingRequest request) {
        if (request.getDaysOfWeek() == null || request.getDaysOfWeek().isEmpty()) {
            throw new BusinessException("Chọn ít nhất một thứ trong tuần", "INVALID_RECURRING_DAYS");
        }
        if (request.getNumberOfWeeks() == null || request.getNumberOfWeeks() < 1) {
            throw new BusinessException("Số tuần lặp lại phải lớn hơn 0", "INVALID_RECURRING_WEEKS");
        }

        LocalDate endDate = request.getStartDate().plusWeeks(request.getNumberOfWeeks()).minusDays(1);
        List<LocalDate> dates = new ArrayList<>();
        LocalDate cursor = request.getStartDate();
        while (!cursor.isAfter(endDate)) {
            if (request.getDaysOfWeek().contains(cursor.getDayOfWeek())) {
                dates.add(cursor);
            }
            cursor = cursor.plusDays(1);
        }
        return dates;
    }

    private List<LocalDate> generateMonthlyRecurringDates(RecurringBookingRequest request) {
        if (request.getNumberOfMonths() == null || request.getNumberOfMonths() < 1) {
            throw new BusinessException("Số tháng lặp lại phải lớn hơn 0", "INVALID_RECURRING_MONTHS");
        }

        int targetDay = request.getDayOfMonth() != null
                ? request.getDayOfMonth()
                : request.getStartDate().getDayOfMonth();
        List<LocalDate> dates = new ArrayList<>();

        for (int index = 0; index < request.getNumberOfMonths(); index++) {
            YearMonth month = YearMonth.from(request.getStartDate().plusMonths(index));
            LocalDate date = month.atDay(Math.min(targetDay, month.lengthOfMonth()));
            if (!date.isBefore(request.getStartDate())) {
                dates.add(date);
            }
        }
        return dates;
    }

    private RecurringBookingResponse.SkippedOccurrence toSkippedOccurrence(
            Pitch pitch,
            TimeSlot timeSlot,
            LocalDate bookingDate
    ) {
        return new RecurringBookingResponse.SkippedOccurrence(
                bookingDate,
                pitch.getId(),
                timeSlot.getId(),
                "SLOT_CONFLICT",
                "Ca đặt sân đã bị trùng lịch"
        );
    }

    private RecurringBookingResponse buildRecurringResponse(
            int requestedCount,
            List<PlayerBookingResponse> createdBookings,
            List<RecurringBookingResponse.SkippedOccurrence> skippedOccurrences,
            String message
    ) {
        BigDecimal totalPrice = createdBookings.stream()
                .map(PlayerBookingResponse::totalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalDepositAmount = createdBookings.stream()
                .map(PlayerBookingResponse::depositAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new RecurringBookingResponse(
                requestedCount,
                createdBookings.size(),
                skippedOccurrences.size(),
                totalPrice,
                totalDepositAmount,
                createdBookings,
                skippedOccurrences,
                message
        );
    }

    private List<BookingServiceItem> buildServiceItems(CreateBookingRequest request, Pitch pitch) {
        return buildServiceItems(request.getServices(), pitch);
    }

    private List<BookingServiceItem> buildServiceItems(
            List<CreateBookingRequest.ServiceRequest> services,
            Pitch pitch
    ) {
        if (services == null || services.isEmpty()) {
            return List.of();
        }

        List<BookingServiceItem> items = new ArrayList<>();
        for (CreateBookingRequest.ServiceRequest serviceRequest : services) {
            if (serviceRequest.getQuantity() == null || serviceRequest.getQuantity() <= 0) {
                throw new BusinessException("Số lượng dịch vụ phải lớn hơn 0", "INVALID_SERVICE_QUANTITY");
            }

            AddonService service = addonServiceRepository.findById(serviceRequest.getServiceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy dịch vụ với ID: " + serviceRequest.getServiceId(), "Service"));

            if (!isServiceAvailableForPitch(service, pitch)) {
                throw new BusinessException("Dịch vụ không thuộc cụm sân đã chọn", "SERVICE_VENUE_MISMATCH");
            }
            if (service.getPrice() == null) {
                throw new BusinessException("Dịch vụ chưa có giá", "SERVICE_PRICE_NOT_SET");
            }
            if (service.getStatus() != null && !"ACTIVE".equalsIgnoreCase(service.getStatus())) {
                throw new BusinessException("Dịch vụ không còn kinh doanh", "SERVICE_NOT_ACTIVE");
            }

            BookingServiceItem item = new BookingServiceItem();
            item.setService(service);
            item.setQuantity(serviceRequest.getQuantity());
            item.setPriceAtBooking(service.getPrice());
            items.add(item);
        }
        return items;
    }

    private boolean isServiceAvailableForPitch(AddonService service, Pitch pitch) {
        Integer pitchVenueId = pitch.getVenue() != null ? pitch.getVenue().getId() : null;
        if (pitchVenueId == null) {
            return false;
        }
        if (service.getVenue() != null && pitchVenueId.equals(service.getVenue().getId())) {
            return true;
        }
        return service.getPitch() != null
                && service.getPitch().getVenue() != null
                && pitchVenueId.equals(service.getPitch().getVenue().getId());
    }

    private boolean isWeekend(LocalDate date) {
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        return dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY;
    }

    private BigDecimal calculateDepositAmount(BigDecimal totalPrice) {
        return totalPrice.multiply(BigDecimal.valueOf(0.5)).setScale(2, RoundingMode.HALF_UP);
    }

    public void publishBookingStatusChanged(Booking booking, BookingStatus oldStatus, BookingStatus newStatus) {
        if (booking.getPlayer() == null || oldStatus == newStatus) {
            return;
        }

        String pitchName = booking.getPitch() != null && booking.getPitch().getName() != null
                ? booking.getPitch().getName()
                : "N/A";

        eventPublisher.publishEvent(new BookingStatusChangedEvent(
                booking.getId(),
                booking.getPlayer().getId(),
                oldStatus,
                newStatus,
                pitchName,
                booking.getBookingDate(),
                booking.getStartTime()
        ));
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
        booking.setStatus(BookingStatus.RESERVED);
        booking.setBookingType("MATCH_AUTO");
        booking.setTotalPrice(totalPrice); // Lưu đúng tổng tiền tính được từ CSDL!

        return bookingRepository.save(booking);
    }
}
