package com.kstn.group4.backend.venue.repository;

import com.kstn.group4.backend.venue.entity.PitchReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PitchReviewRepository extends JpaRepository<PitchReview, Integer> {
    boolean existsByBookingId(Integer bookingId);

    Page<PitchReview> findByPitchIdOrderByCreatedAtDesc(Integer pitchId, Pageable pageable);

    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM PitchReview r WHERE r.pitch.venue.id = :venueId")
    Double averageRatingByVenueId(@Param("venueId") Integer venueId);

    @Query("SELECT COUNT(r) FROM PitchReview r WHERE r.pitch.venue.id = :venueId")
    Long countByVenueId(@Param("venueId") Integer venueId);
}
