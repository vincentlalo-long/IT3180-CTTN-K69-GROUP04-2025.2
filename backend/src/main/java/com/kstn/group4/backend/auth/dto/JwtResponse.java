package com.kstn.group4.backend.auth.dto;

public record JwtResponse(
        String token,
        String type,
        Integer id,
        String username,
        String email,
        String role
) {
    public JwtResponse(String token, Integer id, String username, String email, String role) {
        this(token, "Bearer", id, username, email, role);
    }
}