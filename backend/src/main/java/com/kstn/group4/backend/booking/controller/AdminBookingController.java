package com.kstn.group4.backend.booking.controller;

import com.kstn.group4.backend.booking.dto.admin.AdminBookingSummaryResponse;
import com.kstn.group4.backend.booking.dto.admin.AdminBookingDetailResponse;
import com.kstn.group4.backend.booking.dto.admin.AdminUpdateBookingRequest;
import com.kstn.group4.backend.booking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/bookings")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminBookingController {

    private final BookingService bookingService;

    /**
     * Lấy danh sách booking (Admin thấy tên khách, SĐT khách ngay tại list để tiện xử lý)
     */
    @GetMapping
    public ResponseEntity<Page<AdminBookingSummaryResponse>> getAllBookings(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer pitchId,
            Pageable pageable
    ) {
        return ResponseEntity.ok(bookingService.searchAllBookingsForAdmin(date, status, pitchId, pageable));
    }

    /**
     * Xem chi tiết 1 đơn (Có thêm các thông tin như dịch vụ đi kèm, ghi chú hệ thống)
     */
    @GetMapping("/{id}")
    public ResponseEntity<AdminBookingDetailResponse> getBookingDetail(@PathVariable("id") Integer bookingId) {
        return ResponseEntity.ok(bookingService.getBookingDetailForAdmin(bookingId));
    }

    /**
     * Cập nhật trạng thái (PENDING, BOOKED, PLAYING, COMPLETED, CANCELLED)
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateBookingStatus(
            @PathVariable("id") Integer bookingId,
            @Valid @RequestBody AdminUpdateBookingRequest request // Dùng đúng cái DTO này
    ){
        // Truyền cả object request vào, không truyền request.status()
        bookingService.updateBookingStatus(bookingId, request); 
        return ResponseEntity.ok().build();
}
}