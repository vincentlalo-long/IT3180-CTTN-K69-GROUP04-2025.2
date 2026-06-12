package com.kstn.group4.backend.notification.service;

import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.notification.dto.NotificationResponse;
import com.kstn.group4.backend.notification.entity.Notification;
import com.kstn.group4.backend.notification.entity.NotificationType;
import com.kstn.group4.backend.notification.repository.NotificationRepository;
import com.kstn.group4.backend.user.entity.User;
import com.kstn.group4.backend.user.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getMyNotifications(Integer recipientId, Pageable pageable) {
        return notificationRepository.findByRecipient_IdOrderByCreatedAtDesc(recipientId, pageable)
                .map(NotificationResponse::from);
    }

    @Transactional(readOnly = true)
    public long countUnread(Integer recipientId) {
        return notificationRepository.countByRecipient_IdAndReadAtIsNull(recipientId);
    }

    public NotificationResponse markAsRead(Long notificationId, Integer recipientId) {
        Notification notification = notificationRepository.findByIdAndRecipient_Id(notificationId, recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found", "Notification"));

        if (notification.getReadAt() == null) {
            notification.setReadAt(LocalDateTime.now());
            notification = notificationRepository.save(notification);
        }

        return NotificationResponse.from(notification);
    }

    public int markAllAsRead(Integer recipientId) {
        return notificationRepository.markAllAsRead(recipientId, LocalDateTime.now());
    }

    public Notification createNotification(
            Integer recipientId,
            NotificationType type,
            String title,
            String message,
            String targetType,
            String targetId
    ) {
        if (recipientId == null) {
            return null;
        }

        User recipient = userRepository.findById(recipientId).orElse(null);
        if (recipient == null) {
            return null;
        }

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setTargetType(targetType);
        notification.setTargetId(targetId);
        return notificationRepository.save(notification);
    }

    public void createNotificationsForTeam(
            Long teamId,
            NotificationType type,
            String title,
            String message,
            String targetType,
            String targetId
    ) {
        if (teamId == null) {
            return;
        }

        List<User> teamUsers = userRepository.findByTeamId(teamId);
        Set<Integer> recipientIds = new LinkedHashSet<>();
        for (User user : teamUsers) {
            recipientIds.add(user.getId());
        }

        for (Integer recipientId : recipientIds) {
            createNotification(recipientId, type, title, message, targetType, targetId);
        }
    }
}
