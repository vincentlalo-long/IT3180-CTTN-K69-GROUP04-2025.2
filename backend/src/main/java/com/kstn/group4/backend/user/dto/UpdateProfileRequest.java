package com.kstn.group4.backend.user.dto;

public record UpdateProfileRequest(
    String username,
    String phoneNumber
) {}