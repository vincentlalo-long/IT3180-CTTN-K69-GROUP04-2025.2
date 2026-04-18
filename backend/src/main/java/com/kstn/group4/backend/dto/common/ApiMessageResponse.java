package com.kstn.group4.backend.dto.common;

import lombok.Builder;

@Builder
public record ApiMessageResponse(
        String message
) {
}
