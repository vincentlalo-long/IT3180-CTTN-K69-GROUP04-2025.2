package com.kstn.group4.backend.user.dto;

import java.time.LocalDateTime;

public record UserResponseDTO(
        Integer id,
        String username,
        String email,
        String role,
        String phoneNumber,
        String avatarUrl,
        Long teamId,
        LocalDateTime createdAt
) {
}
