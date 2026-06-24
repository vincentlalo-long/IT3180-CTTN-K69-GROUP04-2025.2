package com.kstn.group4.backend.booking;

import com.kstn.group4.backend.activitylog.service.ActivityLogService;
import com.kstn.group4.backend.booking.dto.player.CreateBookingRequest;
import com.kstn.group4.backend.booking.dto.player.PlayerBookingResponse;
import com.kstn.group4.backend.booking.entity.Booking;
import com.kstn.group4.backend.booking.entity.BookingStatus;
import com.kstn.group4.backend.booking.repository.BookingRepository;
import com.kstn.group4.backend.booking.repository.BookingServiceItemRepository;
import com.kstn.group4.backend.booking.service.BookingPaymentService;
import com.kstn.group4.backend.booking.service.BookingService;
import com.kstn.group4.backend.exception.BusinessException;
import com.kstn.group4.backend.exception.ForbiddenException;
import com.kstn.group4.backend.exception.ResourceConflictException;
import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.user.entity.User;
import com.kstn.group4.backend.user.repository.UserRepository;
import com.kstn.group4.backend.venue.entity.Pitch;
import com.kstn.group4.backend.venue.entity.TimeSlot;
import com.kstn.group4.backend.venue.entity.Venue;
import com.kstn.group4.backend.venue.repository.AddonServiceRepository;
import com.kstn.group4.backend.venue.repository.PitchRepository;
import com.kstn.group4.backend.venue.repository.PitchReviewRepository;
import com.kstn.group4.backend.venue.repository.PriceRuleRepository;
import com.kstn.group4.backend.venue.repository.TimeSlotRepository;
import com.kstn.group4.backend.wallet.service.WalletService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class BookingServiceAdvancedTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private BookingServiceItemRepository bookingServiceItemRepository;
    @Mock private UserRepository userRepository;
    @Mock private PitchRepository pitchRepository;
    @Mock private PitchReviewRepository pitchReviewRepository;
    @Mock private PriceRuleRepository priceRuleRepository;
    @Mock private TimeSlotRepository timeSlotRepository;
    @Mock private AddonServiceRepository addonServiceRepository;
    @Mock private ActivityLogService activityLogService;
    @Mock private BookingPaymentService bookingPaymentService;
    @Mock private WalletService walletService;
    @Mock private ApplicationEventPublisher eventPublisher;

    @InjectMocks private BookingService bookingService;

    private User player;
    private User otherPlayer;
    private Pitch pitch;
    private TimeSlot timeSlot;
    private Venue venue;

    @BeforeEach
    void setUp() {
        player = new User("player1", "player1@email.com", "password", "USER");
        player.setId(1);

        otherPlayer = new User("player2", "player2@email.com", "password", "USER");
        otherPlayer.setId(2);

        venue = new Venue();
        venue.setId(10);
        venue.setOpenTime(LocalTime.of(6, 0));
        venue.setCloseTime(LocalTime.of(23, 0));

        pitch = new Pitch();
        pitch.setId(100);
        pitch.setName("Pitch A");
        pitch.setBasePrice(new BigDecimal("200000"));
        pitch.setVenue(venue);

        timeSlot = new TimeSlot();
        timeSlot.setId(5);
        timeSlot.setSlotNumber(5);
        timeSlot.setStartTime(LocalTime.of(14, 0));
        timeSlot.setEndTime(LocalTime.of(15, 30));
    }

    private Booking buildBooking(Integer id, User owner, BookingStatus status, LocalDate date, LocalTime startTime) {
        Booking booking = new Booking();
        booking.setId(id);
        booking.setPlayer(owner);
        booking.setPitch(pitch);
        booking.setTimeSlot(timeSlot);
        booking.setBookingDate(date);
        booking.setStartTime(startTime);
        booking.setEndTime(startTime.plusMinutes(90));
        booking.setStatus(status);
        booking.setTotalPrice(new BigDecimal("300000"));
        return booking;
    }

    // ==================== createBooking ====================

    @Nested
    @DisplayName("createBooking edge cases")
    class CreateBookingEdgeCases {

        @Test
        @DisplayName("createBooking with past date throws BusinessException")
        void createBooking_pastDate_throwsBusinessException() {
            LocalDate pastDate = LocalDate.now().minusDays(1);

            when(userRepository.findById(1)).thenReturn(Optional.of(player));

            CreateBookingRequest request = new CreateBookingRequest();
            request.setPitchId(100);
            request.setTimeSlotId(5);
            request.setBookingDate(pastDate);

            assertThatThrownBy(() -> bookingService.createBooking(1, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("quá khứ");
        }

        @Test
        @DisplayName("createBooking with already booked slot throws ResourceConflictException")
        void createBooking_alreadyBookedSlot_throwsResourceConflictException() {
            LocalDate futureDate = LocalDate.now().plusDays(30);

            when(userRepository.findById(1)).thenReturn(Optional.of(player));
            when(pitchRepository.findByIdForUpdate(100)).thenReturn(Optional.of(pitch));
            when(timeSlotRepository.findById(5)).thenReturn(Optional.of(timeSlot));
            when(bookingRepository.existsByPitchIdAndTimeSlotIdAndBookingDate(100, 5, futureDate))
                    .thenReturn(true);

            CreateBookingRequest request = new CreateBookingRequest();
            request.setPitchId(100);
            request.setTimeSlotId(5);
            request.setBookingDate(futureDate);

            assertThatThrownBy(() -> bookingService.createBooking(1, request))
                    .isInstanceOf(ResourceConflictException.class)
                    .hasMessageContaining("đã được đặt");
        }

        @Test
        @DisplayName("createBooking with non-existent pitch throws ResourceNotFoundException")
        void createBooking_nonExistentPitch_throwsResourceNotFoundException() {
            LocalDate futureDate = LocalDate.now().plusDays(30);

            when(userRepository.findById(1)).thenReturn(Optional.of(player));
            when(pitchRepository.findByIdForUpdate(999)).thenReturn(Optional.empty());

            CreateBookingRequest request = new CreateBookingRequest();
            request.setPitchId(999);
            request.setTimeSlotId(5);
            request.setBookingDate(futureDate);

            assertThatThrownBy(() -> bookingService.createBooking(1, request))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("sân");
        }

        @Test
        @DisplayName("createBooking with non-existent user throws ResourceNotFoundException")
        void createBooking_nonExistentUser_throwsResourceNotFoundException() {
            when(userRepository.findById(999)).thenReturn(Optional.empty());

            CreateBookingRequest request = new CreateBookingRequest();
            request.setPitchId(100);
            request.setTimeSlotId(5);
            request.setBookingDate(LocalDate.now().plusDays(1));

            assertThatThrownBy(() -> bookingService.createBooking(999, request))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("người dùng");
        }

        @Test
        @DisplayName("createBooking with null booking date throws BusinessException")
        void createBooking_nullBookingDate_throwsBusinessException() {
            when(userRepository.findById(1)).thenReturn(Optional.of(player));

            CreateBookingRequest request = new CreateBookingRequest();
            request.setPitchId(100);
            request.setTimeSlotId(5);
            request.setBookingDate(null);

            assertThatThrownBy(() -> bookingService.createBooking(1, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("trống");
        }
    }

    // ==================== cancelBooking ====================

    @Nested
    @DisplayName("cancelBooking edge cases")
    class CancelBookingEdgeCases {

        @Test
        @DisplayName("cancelBooking by non-owner throws ForbiddenException")
        void cancelBooking_byNonOwner_throwsForbiddenException() {
            Booking booking = buildBooking(1, player, BookingStatus.RESERVED,
                    LocalDate.now().plusDays(10), LocalTime.of(10, 0));

            when(bookingRepository.findByIdWithDetails(1)).thenReturn(Optional.of(booking));
            when(bookingPaymentService.getPaidAmountWithLegacyFallback(any())).thenReturn(BigDecimal.ZERO);

            assertThatThrownBy(() -> bookingService.cancelBooking(1, otherPlayer.getId()))
                    .isInstanceOf(ForbiddenException.class)
                    .hasMessageContaining("quyền");
        }

        @Test
        @DisplayName("cancelBooking already cancelled booking throws BusinessException")
        void cancelBooking_alreadyCancelled_throwsBusinessException() {
            Booking booking = buildBooking(1, player, BookingStatus.CANCELLED,
                    LocalDate.now().plusDays(10), LocalTime.of(10, 0));

            when(bookingRepository.findByIdWithDetails(1)).thenReturn(Optional.of(booking));
            when(bookingPaymentService.getPaidAmountWithLegacyFallback(any())).thenReturn(BigDecimal.ZERO);

            assertThatThrownBy(() -> bookingService.cancelBooking(1, player.getId()))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("PENDING/BOOKED");
        }

        @Test
        @DisplayName("cancelBooking after cancellation deadline (< 24h) throws BusinessException")
        void cancelBooking_afterDeadline_throwsBusinessException() {
            // Match is less than 24 hours from now
            LocalDateTime matchStart = LocalDateTime.now().plusHours(12);
            Booking booking = buildBooking(1, player, BookingStatus.RESERVED,
                    matchStart.toLocalDate(), matchStart.toLocalTime());

            when(bookingRepository.findByIdWithDetails(1)).thenReturn(Optional.of(booking));
            when(bookingPaymentService.getPaidAmountWithLegacyFallback(any())).thenReturn(BigDecimal.ZERO);

            assertThatThrownBy(() -> bookingService.cancelBooking(1, player.getId()))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("24 tiếng");
        }

        @Test
        @DisplayName("cancelBooking with non-existent booking throws ResourceNotFoundException")
        void cancelBooking_nonExistentBooking_throwsResourceNotFoundException() {
            when(bookingRepository.findByIdWithDetails(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> bookingService.cancelBooking(999, player.getId()))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("cancelBooking with COMPLETED status throws BusinessException")
        void cancelBooking_completedStatus_throwsBusinessException() {
            Booking booking = buildBooking(1, player, BookingStatus.COMPLETED,
                    LocalDate.now().plusDays(10), LocalTime.of(10, 0));

            when(bookingRepository.findByIdWithDetails(1)).thenReturn(Optional.of(booking));
            when(bookingPaymentService.getPaidAmountWithLegacyFallback(any())).thenReturn(BigDecimal.ZERO);

            assertThatThrownBy(() -> bookingService.cancelBooking(1, player.getId()))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("PENDING/BOOKED");
        }
    }

    // ==================== getMyBookings ====================

    @Nested
    @DisplayName("getMyBookings paginated results")
    class GetMyBookingsTests {

        @Test
        @DisplayName("getMyBookings returns paginated results correctly")
        void getMyBookings_returnsPaginatedResults() {
            Booking b1 = buildBooking(1, player, BookingStatus.RESERVED,
                    LocalDate.now().plusDays(5), LocalTime.of(10, 0));
            Booking b2 = buildBooking(2, player, BookingStatus.BOOKED,
                    LocalDate.now().plusDays(6), LocalTime.of(14, 0));
            Booking b3 = buildBooking(3, player, BookingStatus.COMPLETED,
                    LocalDate.now().plusDays(7), LocalTime.of(18, 0));

            Pageable pageable = PageRequest.of(0, 2);
            Page<Booking> bookingPage = new PageImpl<>(List.of(b1, b2), pageable, 3);

            when(bookingRepository.findByPlayerId(1, pageable)).thenReturn(bookingPage);
            when(bookingPaymentService.getPaidAmountWithLegacyFallback(any())).thenReturn(BigDecimal.ZERO);
            when(pitchReviewRepository.existsByBookingId(any())).thenReturn(false);

            Page<PlayerBookingResponse> result = bookingService.getMyBookings(1, pageable);

            assertThat(result.getContent()).hasSize(2);
            assertThat(result.getTotalElements()).isEqualTo(3);
            assertThat(result.getNumber()).isEqualTo(0);
            assertThat(result.getSize()).isEqualTo(2);
        }

        @Test
        @DisplayName("getMyBookings with empty page returns empty content")
        void getMyBookings_emptyPage_returnsEmptyContent() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<Booking> emptyPage = new PageImpl<>(List.of(), pageable, 0);

            when(bookingRepository.findByPlayerId(99, pageable)).thenReturn(emptyPage);

            Page<PlayerBookingResponse> result = bookingService.getMyBookings(99, pageable);

            assertThat(result.getContent()).isEmpty();
            assertThat(result.getTotalElements()).isEqualTo(0);
        }
    }

    // ==================== getMyBooking ====================

    @Nested
    @DisplayName("getMyBooking edge cases")
    class GetMyBookingTests {

        @Test
        @DisplayName("getMyBooking for non-existent booking throws ResourceNotFoundException")
        void getMyBooking_nonExistentBooking_throwsResourceNotFoundException() {
            when(bookingRepository.findByIdWithDetails(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> bookingService.getMyBooking(999, player.getId()))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("ID");
        }

        @Test
        @DisplayName("getMyBooking for booking belonging to different user throws ForbiddenException")
        void getMyBooking_differentUser_throwsForbiddenException() {
            Booking booking = buildBooking(1, player, BookingStatus.RESERVED,
                    LocalDate.now().plusDays(5), LocalTime.of(10, 0));

            when(bookingRepository.findByIdWithDetails(1)).thenReturn(Optional.of(booking));
            when(bookingPaymentService.getPaidAmountWithLegacyFallback(any())).thenReturn(BigDecimal.ZERO);

            assertThatThrownBy(() -> bookingService.getMyBooking(1, otherPlayer.getId()))
                    .isInstanceOf(ForbiddenException.class)
                    .hasMessageContaining("quyền");
        }

        @Test
        @DisplayName("getMyBooking for booking owned by user returns booking successfully")
        void getMyBooking_owner_returnsBookingSuccessfully() {
            Booking booking = buildBooking(1, player, BookingStatus.RESERVED,
                    LocalDate.now().plusDays(5), LocalTime.of(10, 0));

            when(bookingRepository.findByIdWithDetails(1)).thenReturn(Optional.of(booking));
            when(bookingPaymentService.getPaidAmountWithLegacyFallback(any())).thenReturn(BigDecimal.ZERO);
            when(pitchReviewRepository.existsByBookingId(1)).thenReturn(false);

            PlayerBookingResponse response = bookingService.getMyBooking(1, player.getId());

            assertThat(response).isNotNull();
            assertThat(response.id()).isEqualTo(1);
            assertThat(response.pitchName()).isEqualTo("Pitch A");
        }
    }
}
