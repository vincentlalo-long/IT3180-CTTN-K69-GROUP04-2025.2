package com.kstn.group4.backend.venue.controller;

import com.kstn.group4.backend.config.security.services.UserPrincipal;
import com.kstn.group4.backend.venue.dto.admin.PitchDetailResponse;
import com.kstn.group4.backend.venue.entity.Pitch;
import com.kstn.group4.backend.venue.service.admin.PitchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminPitchController {

    private final PitchService pitchService;

    @GetMapping("/venues/{venueId}/pitches")
    public ResponseEntity<Page<PitchDetailResponse>> getMyPitchesByVenue(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Integer venueId,
            Pageable pageable
    ) {
        return ResponseEntity.ok(pitchService.getPitchesByVenueForManager(venueId, principal.getId(), pageable));
    }

    @GetMapping("/pitches/{pitchId}")
    public ResponseEntity<PitchDetailResponse> getMyPitchDetail(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Integer pitchId
    ) {
        return ResponseEntity.ok(pitchService.getPitchDetailForManager(pitchId, principal.getId()));
    }

    @PostMapping("/venues/{venueId}/pitches")
    public ResponseEntity<PitchDetailResponse> createPitch(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Integer venueId,
            @RequestBody Pitch request
    ) {
        PitchDetailResponse response = pitchService.addPitchToVenueForManager(venueId, request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/pitches/{pitchId}")
    public ResponseEntity<PitchDetailResponse> updatePitch(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Integer pitchId,
            @RequestBody Pitch request
    ) {
        return ResponseEntity.ok(pitchService.updatePitchForManager(pitchId, request, principal.getId()));
    }

    @DeleteMapping("/pitches/{pitchId}")
    public ResponseEntity<Void> deletePitch(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Integer pitchId
    ) {
        pitchService.deletePitchForManager(pitchId, principal.getId());
        return ResponseEntity.noContent().build();
    }
}
