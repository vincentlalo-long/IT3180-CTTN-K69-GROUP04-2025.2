package com.kstn.group4.backend.booking.controller;

import com.kstn.group4.backend.booking.dto.player.CreateBookingRequest;
import com.kstn.group4.backend.booking.dto.player.PlayerBookingResponse;
import com.kstn.group4.backend.booking.service.BookingService;
import com.kstn.group4.backend.config.security.services.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/player/bookings")
@PreAuthorize("hasAuthority('PLAYER')")
public class PlayerBookingController {

	private final BookingService bookingService;

	@PostMapping
	public ResponseEntity<PlayerBookingResponse> createBooking(
			@AuthenticationPrincipal UserPrincipal principal,
			@Valid @RequestBody CreateBookingRequest request
	) {
		PlayerBookingResponse response = bookingService.createBooking(principal.getId(), request);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	@PatchMapping("/{bookingId}/cancel")
	public ResponseEntity<Void> cancelBooking(
			@AuthenticationPrincipal UserPrincipal principal,
			@PathVariable Integer bookingId
	) {
		bookingService.cancelBooking(bookingId, principal.getId());
		return ResponseEntity.noContent().build();
	}

	@GetMapping
	public ResponseEntity<Page<PlayerBookingResponse>> getMyBookings(
			@AuthenticationPrincipal UserPrincipal principal,
			Pageable pageable
	) {
		return ResponseEntity.ok(bookingService.getMyBookings(principal.getId(), pageable));
	}

	@GetMapping("/{bookingId}")
	public ResponseEntity<PlayerBookingResponse> getMyBooking(
			@AuthenticationPrincipal UserPrincipal principal,
			@PathVariable Integer bookingId
	) {
		return ResponseEntity.ok(bookingService.getMyBooking(bookingId, principal.getId()));
	}
}
