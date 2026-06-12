package com.kstn.group4.backend.venue.dto.player;

import java.time.LocalDateTime;

public record PitchReviewResponse(
        Integer id,
        Integer bookingId,
        Integer pitchId,
        String pitchName,
        Integer playerId,
        String playerName,
        Integer rating,
        String content,
        Integer rewardPoints,
        Integer memberPoints,
        LocalDateTime createdAt
) {
}
