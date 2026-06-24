package com.kstn.group4.backend.booking.dto.player;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record PlayerBookingResponse(
	Integer id,
	Integer pitchId,
	String pitchName,
	LocalDate bookingDate,
	LocalTime startTime,
	LocalTime endTime,
	BigDecimal totalPrice,
	BigDecimal depositAmount,
	String status,
	Boolean reviewed
) {
}
