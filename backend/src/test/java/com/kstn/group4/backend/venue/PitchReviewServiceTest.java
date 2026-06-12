package com.kstn.group4.backend.venue;

import com.kstn.group4.backend.booking.entity.Booking;
import com.kstn.group4.backend.booking.entity.BookingStatus;
import com.kstn.group4.backend.booking.repository.BookingRepository;
import com.kstn.group4.backend.exception.BusinessException;
import com.kstn.group4.backend.exception.ForbiddenException;
import com.kstn.group4.backend.exception.ResourceConflictException;
import com.kstn.group4.backend.user.entity.User;
import com.kstn.group4.backend.venue.dto.player.CreatePitchReviewRequest;
import com.kstn.group4.backend.venue.dto.player.PitchReviewResponse;
import com.kstn.group4.backend.venue.entity.Pitch;
import com.kstn.group4.backend.venue.entity.PitchReview;
import com.kstn.group4.backend.venue.repository.PitchRepository;
import com.kstn.group4.backend.venue.repository.PitchReviewRepository;
import com.kstn.group4.backend.venue.service.player.PitchReviewService;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PitchReviewServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private PitchReviewRepository pitchReviewRepository;

    @Mock
    private PitchRepository pitchRepository;

    private PitchReviewService pitchReviewService;

    @BeforeEach
    void setUp() {
        pitchReviewService = new PitchReviewService(bookingRepository, pitchReviewRepository, pitchRepository);
    }

    @Test
    void createReview_completedOwnBooking_savesReviewAndAddsRewardPoints() {
        Booking booking = createBooking(10, 2, BookingStatus.COMPLETED);
        when(bookingRepository.findByIdWithDetails(10)).thenReturn(Optional.of(booking));
        when(pitchReviewRepository.existsByBookingId(10)).thenReturn(false);
        when(pitchReviewRepository.save(any(PitchReview.class))).thenAnswer(invocation -> {
            PitchReview review = invocation.getArgument(0);
            review.setId(99);
            review.setCreatedAt(LocalDateTime.of(2026, 6, 9, 10, 0));
            return review;
        });

        PitchReviewResponse response = pitchReviewService.createReview(
                2,
                new CreatePitchReviewRequest(10, 5, "Sân tốt")
        );

        assertEquals(99, response.id());
        assertEquals(10, response.bookingId());
        assertEquals(5, response.rating());
        assertEquals(PitchReviewService.REVIEW_REWARD_POINTS, response.rewardPoints());
        assertEquals(15, response.memberPoints());
        assertEquals(15, booking.getPlayer().getMembershipPoints());
        verify(pitchReviewRepository).save(any(PitchReview.class));
    }

    @Test
    void createReview_otherPlayerBooking_throwsForbidden() {
        Booking booking = createBooking(10, 2, BookingStatus.COMPLETED);
        when(bookingRepository.findByIdWithDetails(10)).thenReturn(Optional.of(booking));

        assertThrows(
                ForbiddenException.class,
                () -> pitchReviewService.createReview(3, new CreatePitchReviewRequest(10, 5, "Sân tốt"))
        );
    }

    @Test
    void createReview_bookingNotCompleted_throwsBusinessException() {
        Booking booking = createBooking(10, 2, BookingStatus.CONFIRMED);
        when(bookingRepository.findByIdWithDetails(10)).thenReturn(Optional.of(booking));

        assertThrows(
                BusinessException.class,
                () -> pitchReviewService.createReview(2, new CreatePitchReviewRequest(10, 5, "Sân tốt"))
        );
    }

    @Test
    void createReview_duplicateReview_throwsConflict() {
        Booking booking = createBooking(10, 2, BookingStatus.COMPLETED);
        when(bookingRepository.findByIdWithDetails(10)).thenReturn(Optional.of(booking));
        when(pitchReviewRepository.existsByBookingId(10)).thenReturn(true);

        assertThrows(
                ResourceConflictException.class,
                () -> pitchReviewService.createReview(2, new CreatePitchReviewRequest(10, 5, "Sân tốt"))
        );
    }

    @Test
    void createReview_invalidRating_throwsBusinessException() {
        assertThrows(
                BusinessException.class,
                () -> pitchReviewService.createReview(2, new CreatePitchReviewRequest(10, 6, "Sân tốt"))
        );
    }

    private Booking createBooking(Integer bookingId, Integer playerId, BookingStatus status) {
        User player = new User();
        player.setId(playerId);
        player.setUsername("player_" + playerId);
        player.setMembershipPoints(5);

        Pitch pitch = new Pitch();
        pitch.setId(1);
        pitch.setName("San 1");

        Booking booking = new Booking();
        booking.setId(bookingId);
        booking.setPlayer(player);
        booking.setPitch(pitch);
        booking.setStatus(status);
        return booking;
    }
}
