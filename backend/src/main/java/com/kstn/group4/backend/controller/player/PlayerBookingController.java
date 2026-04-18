package com.kstn.group4.backend.controller.player;

import com.kstn.group4.backend.dto.booking.BookingResponse;
import com.kstn.group4.backend.dto.booking.CreateBookingRequest;
import com.kstn.group4.backend.service.AuthenticatedUserService;
import com.kstn.group4.backend.service.BookingService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping({"/players/bookings", "/bookings"})
public class PlayerBookingController {

    private final BookingService bookingService;
    private final AuthenticatedUserService authenticatedUserService;

    @PostMapping
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody CreateBookingRequest request) {
        Integer playerId = authenticatedUserService.getCurrentUserId();
        BookingResponse response = bookingService.createBooking(playerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my-bookings")
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<List<BookingResponse>> getMyBookings() {
        Integer playerId = authenticatedUserService.getCurrentUserId();
        return ResponseEntity.ok(bookingService.getMyBookings(playerId));
    }
}
