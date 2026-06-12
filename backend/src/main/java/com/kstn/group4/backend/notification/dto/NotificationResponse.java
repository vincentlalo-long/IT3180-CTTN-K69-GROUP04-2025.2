package com.kstn.group4.backend.notification.dto;

import com.kstn.group4.backend.notification.entity.Notification;
import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        String type,
        String title,
        String message,
        String targetType,
        String targetId,
        boolean read,
        LocalDateTime createdAt,
        LocalDateTime readAt
) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType().name(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getTargetType(),
                notification.getTargetId(),
                notification.getReadAt() != null,
                notification.getCreatedAt(),
                notification.getReadAt()
        );
    }
}
