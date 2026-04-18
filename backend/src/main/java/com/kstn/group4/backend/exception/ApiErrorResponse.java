package com.kstn.group4.backend.exception;

import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record ApiErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String path
) {
}
