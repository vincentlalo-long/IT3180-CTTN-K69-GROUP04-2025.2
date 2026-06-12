package com.kstn.group4.backend.venue.dto.player;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreatePitchReviewRequest(
        @NotNull(message = "bookingId không được để trống")
        Integer bookingId,

        @NotNull(message = "Số sao không được để trống")
        @Min(value = 1, message = "Số sao tối thiểu là 1")
        @Max(value = 5, message = "Số sao tối đa là 5")
        Integer rating,

        @NotBlank(message = "Nội dung đánh giá không được để trống")
        @Size(max = 1000, message = "Nội dung đánh giá tối đa 1000 ký tự")
        String content
) {
}
