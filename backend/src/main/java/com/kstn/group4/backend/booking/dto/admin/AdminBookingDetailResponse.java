package com.kstn.group4.backend.booking.dto.admin;

import lombok.Builder;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Builder
public record AdminBookingDetailResponse(
        // 1. THÔNG TIN CƠ BẢN (Giống Summary)
        Integer id,
        Integer venueId,
        String venueName,
        String pitchName,
        LocalDate bookingDate,
        LocalTime startTime,
        LocalTime endTime,
        String status,
        
        // 2. THÔNG TIN KHÁCH HÀNG (Chi tiết hơn)
        String customerName,
        String customerPhone,
        String customerEmail, // Thêm email để tiện báo cáo hoặc marketing sau này
        
        // 3. THÔNG TIN TÀI CHÍNH
        BigDecimal totalPrice,      // Tổng tiền (Tiền sân + Tiền dịch vụ)
        BigDecimal depositAmount,   // Tiền đã cọc
        String paymentStatus,       // UNPAID, PARTIAL (đã cọc), PAID (đã trả đủ)
        
        // 4. METADATA & GHI CHÚ NỘI BỘ
        String adminNote,           // Khách hay cao su, cần nhắc nhở...
        LocalDateTime createdAt,    // Ngày giờ khách đặt đơn
        LocalDateTime updatedAt,    // Lần cuối Admin sửa đơn là khi nào
        
        // 5. DỊCH VỤ ĐI KÈM (Nước, bóng, áo...)
        List<AddonServiceItem> addOns
) {
    // Record con nằm gọn bên trong, không cần đẻ thêm file mới
    @Builder
    public record AddonServiceItem(
            String serviceName, // VD: "Nước khoáng Lavie", "Thuê áo bib"
            Integer quantity,   // VD: 10
            BigDecimal price    // VD: 10.000đ
    ) {}
}