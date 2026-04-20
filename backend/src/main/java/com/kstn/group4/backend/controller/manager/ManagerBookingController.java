package com.kstn.group4.backend.controller.manager;

import com.kstn.group4.backend.dto.booking.BookingResponse;
import com.kstn.group4.backend.dto.booking.UpdateBookingStatusRequest;
import com.kstn.group4.backend.service.AuthenticatedUserService;
import com.kstn.group4.backend.service.BookingService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/managers/bookings")
public class ManagerBookingController {

    private final BookingService bookingService;
    private final AuthenticatedUserService authenticatedUserService;

    @GetMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<BookingResponse>> getManagerBookings() {
        Integer managerId = authenticatedUserService.getCurrentUserId();
        return ResponseEntity.ok(bookingService.getManagerBookings(managerId));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @PathVariable("id") Integer bookingId,
            @Valid @RequestBody UpdateBookingStatusRequest request
    ) {
        Integer managerId = authenticatedUserService.getCurrentUserId();
        return ResponseEntity.ok(bookingService.updateBookingStatus(managerId, bookingId, request.status()));
    }
}
