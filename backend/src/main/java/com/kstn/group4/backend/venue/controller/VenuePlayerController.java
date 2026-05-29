package com.kstn.group4.backend.venue.controller;

import com.kstn.group4.backend.venue.dto.player.PitchSlotsResponse;
import com.kstn.group4.backend.venue.dto.player.VenueAvailabilityResponse;
import com.kstn.group4.backend.venue.dto.player.VenueResponseDTO;
import com.kstn.group4.backend.venue.service.player.VenuePlayerService;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/player/venues")
@PreAuthorize("hasRole('PLAYER')")
public class VenuePlayerController {

	private final VenuePlayerService venuePlayerService;

	@GetMapping
	public ResponseEntity<Page<VenueResponseDTO>> getActiveVenues(Pageable pageable) {
		return ResponseEntity.ok(venuePlayerService.getActiveVenues(pageable));
	}

	@GetMapping("/{id}/availability")
	public ResponseEntity<VenueAvailabilityResponse> getAvailability(
			@PathVariable Integer id,
			@RequestParam(required = false) LocalDate date
	) {
		LocalDate targetDate = date != null ? date : LocalDate.now();
		return ResponseEntity.ok(venuePlayerService.getAvailability(id, targetDate));
	}

	/**
	 * Get detailed slot availability and pricing for a specific pitch on a given date.
	 * 
	 * @param pitchId the ID of the pitch
	 * @param date the target booking date (defaults to today if not provided)
	 * @param filter filter criteria: "all", "available", "occupied" (defaults to "all")
	 * @return PitchSlotsResponse containing all 11 time slots with availability and pricing
	 */
	@GetMapping("/pitches/{pitchId}/slots")
	public ResponseEntity<PitchSlotsResponse> getPitchSlots(
			@PathVariable Integer pitchId,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
			@RequestParam(required = false, defaultValue = "all") String filter
	) {
		LocalDate targetDate = date != null ? date : LocalDate.now();
		return ResponseEntity.ok(venuePlayerService.getPitchSlots(pitchId, targetDate, filter));
	}
}
