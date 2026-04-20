package com.kstn.group4.backend.entity;

import java.util.Locale;

public enum Role {
    OWNER,
    PLAYER,
    ADMIN;

    public static Role fromValue(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Role không được để trống");
        }

        String normalized = value.trim().toUpperCase(Locale.ROOT);
        if ("MANAGER".equals(normalized)) {
            return OWNER;
        }

        return Role.valueOf(normalized);
    }
}