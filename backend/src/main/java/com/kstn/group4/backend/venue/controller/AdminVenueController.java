package com.kstn.group4.backend.venue.controller;

import com.kstn.group4.backend.config.security.services.UserPrincipal;
import com.kstn.group4.backend.venue.dto.admin.AdminVenueResponseDTO;
import com.kstn.group4.backend.venue.entity.Venue;
import com.kstn.group4.backend.venue.service.admin.VenueService;
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
@RequestMapping("/admin/venues")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminVenueController {

    private final VenueService venueService;

    @GetMapping
    public ResponseEntity<Page<AdminVenueResponseDTO>> getMyVenues(
            @AuthenticationPrincipal UserPrincipal principal,
            Pageable pageable
    ) {
        return ResponseEntity.ok(venueService.getVenuesByManager(principal.getId(), pageable));
    }

    @GetMapping("/{venueId}")
    public ResponseEntity<AdminVenueResponseDTO> getMyVenueById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Integer venueId
    ) {
        return ResponseEntity.ok(venueService.getVenueByManager(venueId, principal.getId()));
    }

    @PostMapping
    public ResponseEntity<AdminVenueResponseDTO> createVenue(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Venue request
    ) {
        AdminVenueResponseDTO response = venueService.createVenueByManager(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{venueId}")
    public ResponseEntity<AdminVenueResponseDTO> updateVenue(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Integer venueId,
            @RequestBody Venue request
    ) {
        return ResponseEntity.ok(venueService.updateVenueByManager(venueId, request, principal.getId()));
    }

    @DeleteMapping("/{venueId}")
    public ResponseEntity<Void> deleteVenue(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Integer venueId
    ) {
        venueService.deleteVenueByManager(venueId, principal.getId());
        return ResponseEntity.noContent().build();
    }
}
