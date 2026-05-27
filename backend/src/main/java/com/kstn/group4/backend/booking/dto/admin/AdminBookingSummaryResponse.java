package com.kstn.group4.backend.booking.dto.admin;

import lombok.Builder;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Builder
public record AdminBookingSummaryResponse(
        Integer id,             // Để định danh đơn
        String customerName,    // Người đặt
        String venueName,       // Khu sân (VD: Sân Bách Khoa)
        String pitchName,       // Sân số mấy (VD: Sân 7 - A1)
        LocalDate bookingDate,  // Ngày đá
        LocalTime startTime,    // Giờ bắt đầu
        LocalTime endTime,      // Giờ kết thúc
        BigDecimal depositAmount,  // Tiền cọc (50% tổng)
        BigDecimal totalPrice,  // Giá tiền
        String status            // Trạng thái đơn (BOOKED, PLAYING,...)
) {
}