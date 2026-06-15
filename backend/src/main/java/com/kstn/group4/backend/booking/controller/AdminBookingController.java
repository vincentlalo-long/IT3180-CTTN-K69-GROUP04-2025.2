package com.kstn.group4.backend.booking.controller;

import com.kstn.group4.backend.booking.dto.admin.AdminBookingSummaryResponse;
import com.kstn.group4.backend.booking.dto.admin.AdminBookingDetailResponse;
import com.kstn.group4.backend.booking.dto.admin.AdminUpdateBookingRequest;
import com.kstn.group4.backend.booking.dto.admin.PitchScheduleDto;
import com.kstn.group4.backend.booking.service.BookingAdminService;
import com.kstn.group4.backend.booking.service.BookingService;
import com.kstn.group4.backend.booking.service.InvoicePdfService;
import com.kstn.group4.backend.venue.dto.ServiceItemResponse;
import com.kstn.group4.backend.venue.service.admin.AddonServiceManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/bookings")
@PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
public class AdminBookingController {

    private final BookingService bookingService;
    private final BookingAdminService bookingAdminService;
    private final AddonServiceManagementService addonServiceManagementService;
    private final InvoicePdfService invoicePdfService;

    @GetMapping("/schedules")
    public ResponseEntity<List<PitchScheduleDto>> getPitchSchedules(
            @RequestParam(required = false) Long venueId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(bookingAdminService.getPitchSchedules(venueId, date));
    }

    /**
     * Lấy danh sách booking (Admin thấy tên khách, SĐT khách ngay tại list để tiện xử lý)
     */
    @GetMapping
    public ResponseEntity<Page<AdminBookingSummaryResponse>> getAllBookings(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer venueId,
            Pageable pageable
    ) {
        return ResponseEntity.ok(bookingService.searchAllBookingsForAdmin(date, status, venueId, pageable));
    }

    /**
     * Xem chi tiết 1 đơn (Có thêm các thông tin như dịch vụ đi kèm, ghi chú hệ thống)
     */
    @GetMapping("/{id}")
    public ResponseEntity<AdminBookingDetailResponse> getBookingDetail(@PathVariable("id") Integer bookingId) {
        return ResponseEntity.ok(bookingService.getBookingDetailForAdmin(bookingId));
    }

    @GetMapping(value = "/{id}/invoice.pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> exportInvoice(@PathVariable("id") Integer bookingId) {
        byte[] pdf = invoicePdfService.createAdminInvoicePdf(bookingId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice-" + bookingId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
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

    /**
     * Override booking price manually
     */
    @PutMapping("/{id}/price")
    public ResponseEntity<Void> overrideBookingPrice(
            @PathVariable("id") Integer bookingId,
            @Valid @RequestBody com.kstn.group4.backend.booking.dto.admin.AdminOverridePriceRequest request
    ) {
        bookingService.overrideBookingPrice(bookingId, request.newPrice());
        return ResponseEntity.ok().build();
    }

    /**
     * Chốt hóa đơn: thêm dịch vụ phát sinh, thanh toán nốt, hoàn thành ca đá
     */
    @PostMapping("/{id}/settle")
    public ResponseEntity<com.kstn.group4.backend.booking.dto.admin.AdminBookingDetailResponse> settleBooking(
            @PathVariable("id") Integer bookingId,
            @Valid @RequestBody com.kstn.group4.backend.booking.dto.admin.SettleBookingRequest request
    ) {
        return ResponseEntity.ok(bookingService.settleBooking(bookingId, request));
    }

    /**
     * Lấy danh sách dịch vụ ACTIVE của cụm sân mà booking này thuộc về.
     * Dùng cho modal chốt hóa đơn — không cần check quyền sở hữu cụm sân.
     */
    @GetMapping("/{id}/available-services")
    public ResponseEntity<List<ServiceItemResponse>> getAvailableServices(
            @PathVariable("id") Integer bookingId
    ) {
        AdminBookingDetailResponse detail = bookingService.getBookingDetailForAdmin(bookingId);
        if (detail.venueId() == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(addonServiceManagementService.getActiveServicesForVenue(detail.venueId()));
    }
}
