package com.kstn.group4.backend.venue.controller;

import com.kstn.group4.backend.config.security.services.UserPrincipal;
import com.kstn.group4.backend.venue.dto.admin.AdminVenueResponseDTO;
import com.kstn.group4.backend.venue.dto.admin.VenueUpsertRequest;
import com.kstn.group4.backend.venue.service.admin.FileStorageService;
import com.kstn.group4.backend.venue.service.admin.VenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/venues")
@PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
public class AdminVenueController {

    private final VenueService venueService;
    private final FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<Page<AdminVenueResponseDTO>> getMyVenues(
            @AuthenticationPrincipal UserPrincipal principal,
            Pageable pageable
    ) {
        return ResponseEntity.ok(venueService.getAllVenuesForAdmin(pageable));
    }

    @GetMapping("/{venueId}")
    public ResponseEntity<AdminVenueResponseDTO> getMyVenueById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Integer venueId
    ) {
        return ResponseEntity.ok(venueService.getVenueByIdForAdmin(venueId));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AdminVenueResponseDTO> createVenue(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestPart("venue") VenueUpsertRequest request,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar
    ) {
        String imageUrl = null;
        if (avatar != null && !avatar.isEmpty()) {
            imageUrl = fileStorageService.storeVenueImage(avatar);
        }

        AdminVenueResponseDTO response = venueService.createVenueByManager(request, imageUrl, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping(value = "/{venueId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AdminVenueResponseDTO> updateVenue(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Integer venueId,
            @RequestPart("venue") VenueUpsertRequest request,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar
    ) {
        String imageUrl = null;
        if (avatar != null && !avatar.isEmpty()) {
            imageUrl = fileStorageService.storeVenueImage(avatar);
        }

        return ResponseEntity.ok(venueService.updateVenueByManager(venueId, request, imageUrl, principal.getId()));
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
