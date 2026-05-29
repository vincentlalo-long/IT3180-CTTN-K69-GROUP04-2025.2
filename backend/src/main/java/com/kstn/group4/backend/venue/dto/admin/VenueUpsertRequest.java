package com.kstn.group4.backend.venue.dto.admin;

public record VenueUpsertRequest(
        String name,
        String address,
        String description
) {
}
