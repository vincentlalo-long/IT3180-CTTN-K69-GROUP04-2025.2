package com.kstn.group4.backend.payload;

public record JwtResponse(
        String token,
        String type,
        String username,
        String email,
        String role
) {
    public JwtResponse(String token, String username, String email, String role) {
        this(token, "Bearer", username, email, role);
    }
}