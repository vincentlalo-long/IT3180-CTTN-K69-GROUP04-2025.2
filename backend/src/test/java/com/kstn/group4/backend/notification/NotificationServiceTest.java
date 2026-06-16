package com.kstn.group4.backend.notification;

import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.notification.dto.NotificationResponse;
import com.kstn.group4.backend.notification.entity.Notification;
import com.kstn.group4.backend.notification.entity.NotificationType;
import com.kstn.group4.backend.notification.repository.NotificationRepository;
import com.kstn.group4.backend.notification.service.NotificationService;
import com.kstn.group4.backend.user.entity.User;
import com.kstn.group4.backend.user.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationService notificationService;

    // --- getMyNotifications tests ---

    @Test
    void getMyNotifications_returnsCorrectPage() {
        Integer recipientId = 1;
        Pageable pageable = PageRequest.of(0, 10);

        User user = createUser(recipientId);
        Notification notification = createNotification(1L, user, NotificationType.BOOKING_STATUS, null);
        List<Notification> notifications = List.of(notification);
        Page<Notification> page = new PageImpl<>(notifications, pageable, 1);

        when(notificationRepository.findByRecipient_IdOrderByCreatedAtDesc(recipientId, pageable))
                .thenReturn(page);

        Page<NotificationResponse> result = notificationService.getMyNotifications(recipientId, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertFalse(result.getContent().isEmpty());
        assertEquals(NotificationType.BOOKING_STATUS.name(), result.getContent().get(0).type());
        verify(notificationRepository).findByRecipient_IdOrderByCreatedAtDesc(recipientId, pageable);
    }

    @Test
    void getMyNotifications_emptyResult_returnsEmptyPage() {
        Integer recipientId = 1;
        Pageable pageable = PageRequest.of(0, 10);

        Page<Notification> emptyPage = new PageImpl<>(List.of(), pageable, 0);
        when(notificationRepository.findByRecipient_IdOrderByCreatedAtDesc(recipientId, pageable))
                .thenReturn(emptyPage);

        Page<NotificationResponse> result = notificationService.getMyNotifications(recipientId, pageable);

        assertNotNull(result);
        assertEquals(0, result.getTotalElements());
        assertTrue(result.getContent().isEmpty());
    }

    // --- countUnread tests ---

    @Test
    void countUnread_returnsCorrectCount() {
        Integer recipientId = 1;
        when(notificationRepository.countByRecipient_IdAndReadAtIsNull(recipientId)).thenReturn(5L);

        long count = notificationService.countUnread(recipientId);

        assertEquals(5L, count);
        verify(notificationRepository).countByRecipient_IdAndReadAtIsNull(recipientId);
    }

    @Test
    void countUnread_withNoUnread_returnsZero() {
        Integer recipientId = 1;
        when(notificationRepository.countByRecipient_IdAndReadAtIsNull(recipientId)).thenReturn(0L);

        long count = notificationService.countUnread(recipientId);

        assertEquals(0L, count);
    }

    // --- markAsRead tests ---

    @Test
    void markAsRead_unreadNotification_setsReadAt() {
        Long notificationId = 1L;
        Integer recipientId = 1;
        User user = createUser(recipientId);
        Notification notification = createNotification(notificationId, user, NotificationType.BOOKING_STATUS, null);

        when(notificationRepository.findByIdAndRecipient_Id(notificationId, recipientId))
                .thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        NotificationResponse response = notificationService.markAsRead(notificationId, recipientId);

        assertNotNull(response);
        assertTrue(response.read());
        assertNotNull(response.readAt());
        verify(notificationRepository).save(notification);
    }

    @Test
    void markAsRead_alreadyRead_doesNotUpdateAgain() {
        Long notificationId = 1L;
        Integer recipientId = 1;
        User user = createUser(recipientId);
        LocalDateTime readAtTime = LocalDateTime.of(2026, 6, 10, 10, 0);
        Notification notification = createNotification(notificationId, user, NotificationType.BOOKING_STATUS, readAtTime);

        when(notificationRepository.findByIdAndRecipient_Id(notificationId, recipientId))
                .thenReturn(Optional.of(notification));

        NotificationResponse response = notificationService.markAsRead(notificationId, recipientId);

        assertNotNull(response);
        assertTrue(response.read());
        assertEquals(readAtTime, response.readAt());
    }

    @Test
    void markAsRead_withNonExistentNotification_throwsResourceNotFoundException() {
        when(notificationRepository.findByIdAndRecipient_Id(999L, 1)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> notificationService.markAsRead(999L, 1));
    }

    @Test
    void markAsRead_withWrongRecipient_throwsResourceNotFoundException() {
        Long notificationId = 1L;
        User owner = createUser(1);
        Notification notification = createNotification(notificationId, owner, NotificationType.BOOKING_STATUS, null);

        when(notificationRepository.findByIdAndRecipient_Id(notificationId, 2))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> notificationService.markAsRead(notificationId, 2));
    }

    // --- markAllAsRead tests ---

    @Test
    void markAllAsRead_returnsCorrectCount() {
        Integer recipientId = 1;
        when(notificationRepository.markAllAsRead(eq(recipientId), any(LocalDateTime.class))).thenReturn(3);

        int count = notificationService.markAllAsRead(recipientId);

        assertEquals(3, count);
        verify(notificationRepository).markAllAsRead(eq(recipientId), any(LocalDateTime.class));
    }

    @Test
    void markAllAsRead_withNoUnread_returnsZero() {
        Integer recipientId = 1;
        when(notificationRepository.markAllAsRead(eq(recipientId), any(LocalDateTime.class))).thenReturn(0);

        int count = notificationService.markAllAsRead(recipientId);

        assertEquals(0, count);
    }

    // --- Helper methods ---

    private User createUser(Integer id) {
        User user = new User();
        user.setId(id);
        user.setUsername("user_" + id);
        user.setEmail("user" + id + "@example.com");
        user.setRole("PLAYER");
        return user;
    }

    private Notification createNotification(Long id, User recipient, NotificationType type, LocalDateTime readAt) {
        Notification notification = new Notification();
        notification.setId(id);
        notification.setRecipient(recipient);
        notification.setType(type);
        notification.setTitle("Test notification");
        notification.setMessage("Test message");
        notification.setTargetType("BOOKING");
        notification.setTargetId("1");
        notification.setReadAt(readAt);
        notification.setCreatedAt(LocalDateTime.of(2026, 6, 10, 9, 0));
        return notification;
    }
}
