package com.kstn.group4.backend.venue.controller;

import com.kstn.group4.backend.config.security.services.UserPrincipal;
import com.kstn.group4.backend.venue.dto.player.CreatePitchReviewRequest;
import com.kstn.group4.backend.venue.dto.player.PitchReviewResponse;
import com.kstn.group4.backend.venue.service.player.PitchReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class PitchReviewController {

    private final PitchReviewService pitchReviewService;

    @PostMapping("/player/reviews")
    @PreAuthorize("hasAnyAuthority('PLAYER', 'ROLE_PLAYER')")
    public ResponseEntity<PitchReviewResponse> createReview(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreatePitchReviewRequest request
    ) {
        PitchReviewResponse response = pitchReviewService.createReview(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/pitches/{pitchId}/reviews")
    public ResponseEntity<Page<PitchReviewResponse>> getPitchReviews(
            @PathVariable Integer pitchId,
            Pageable pageable
    ) {
        return ResponseEntity.ok(pitchReviewService.getPitchReviews(pitchId, pageable));
    }
}
