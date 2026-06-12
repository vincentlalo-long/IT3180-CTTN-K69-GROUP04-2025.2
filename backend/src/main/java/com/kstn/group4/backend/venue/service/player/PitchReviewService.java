package com.kstn.group4.backend.venue.service.player;

import com.kstn.group4.backend.booking.entity.Booking;
import com.kstn.group4.backend.booking.entity.BookingStatus;
import com.kstn.group4.backend.booking.repository.BookingRepository;
import com.kstn.group4.backend.exception.BusinessException;
import com.kstn.group4.backend.exception.ForbiddenException;
import com.kstn.group4.backend.exception.ResourceConflictException;
import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.user.entity.User;
import com.kstn.group4.backend.venue.dto.player.CreatePitchReviewRequest;
import com.kstn.group4.backend.venue.dto.player.PitchReviewResponse;
import com.kstn.group4.backend.venue.entity.Pitch;
import com.kstn.group4.backend.venue.entity.PitchReview;
import com.kstn.group4.backend.venue.repository.PitchRepository;
import com.kstn.group4.backend.venue.repository.PitchReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PitchReviewService {

    public static final int REVIEW_REWARD_POINTS = 10;

    private final BookingRepository bookingRepository;
    private final PitchReviewRepository pitchReviewRepository;
    private final PitchRepository pitchRepository;

    @Transactional
    public PitchReviewResponse createReview(Integer playerId, CreatePitchReviewRequest request) {
        validateRequest(request);

        Booking booking = bookingRepository.findByIdWithDetails(request.bookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt sân với ID: " + request.bookingId(), "Booking"));

        if (booking.getPlayer() == null || !booking.getPlayer().getId().equals(playerId)) {
            throw new ForbiddenException("Bạn chỉ có thể đánh giá đơn đặt sân của chính mình");
        }
        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new BusinessException("Chỉ có thể đánh giá đơn đặt sân đã hoàn thành", "BOOKING_NOT_COMPLETED");
        }
        if (pitchReviewRepository.existsByBookingId(booking.getId())) {
            throw new ResourceConflictException("Đơn đặt sân này đã được đánh giá");
        }
        if (booking.getPitch() == null) {
            throw new ResourceNotFoundException("Không tìm thấy sân của đơn đặt sân", "Pitch");
        }

        User player = booking.getPlayer();
        PitchReview review = new PitchReview();
        review.setBooking(booking);
        review.setPitch(booking.getPitch());
        review.setPlayer(player);
        review.setRating(request.rating());
        review.setContent(request.content().trim());

        player.setMembershipPoints((player.getMembershipPoints() == null ? 0 : player.getMembershipPoints()) + REVIEW_REWARD_POINTS);

        try {
            PitchReview savedReview = pitchReviewRepository.save(review);
            return toResponse(savedReview, REVIEW_REWARD_POINTS);
        } catch (DataIntegrityViolationException ex) {
            throw new ResourceConflictException("Đơn đặt sân này đã được đánh giá");
        }
    }

    @Transactional(readOnly = true)
    public Page<PitchReviewResponse> getPitchReviews(Integer pitchId, Pageable pageable) {
        if (!pitchRepository.existsById(pitchId)) {
            throw new ResourceNotFoundException("Không tìm thấy sân với ID: " + pitchId, "Pitch");
        }
        return pitchReviewRepository.findByPitchIdOrderByCreatedAtDesc(pitchId, pageable)
                .map(review -> toResponse(review, 0));
    }

    private void validateRequest(CreatePitchReviewRequest request) {
        if (request == null) {
            throw new BusinessException("Thông tin đánh giá không được để trống", "INVALID_REVIEW_REQUEST");
        }
        if (request.bookingId() == null) {
            throw new BusinessException("bookingId không được để trống", "INVALID_BOOKING_ID");
        }
        if (request.rating() == null || request.rating() < 1 || request.rating() > 5) {
            throw new BusinessException("Số sao phải nằm trong khoảng từ 1 đến 5", "INVALID_REVIEW_RATING");
        }
        if (request.content() == null || request.content().isBlank()) {
            throw new BusinessException("Nội dung đánh giá không được để trống", "INVALID_REVIEW_CONTENT");
        }
    }

    private PitchReviewResponse toResponse(PitchReview review, Integer rewardPoints) {
        Booking booking = review.getBooking();
        Pitch pitch = review.getPitch();
        User player = review.getPlayer();

        return new PitchReviewResponse(
                review.getId(),
                booking != null ? booking.getId() : null,
                pitch != null ? pitch.getId() : null,
                pitch != null ? pitch.getName() : null,
                player != null ? player.getId() : null,
                player != null ? player.getUsername() : null,
                review.getRating(),
                review.getContent(),
                rewardPoints,
                player != null ? player.getMembershipPoints() : null,
                review.getCreatedAt()
        );
    }
}
