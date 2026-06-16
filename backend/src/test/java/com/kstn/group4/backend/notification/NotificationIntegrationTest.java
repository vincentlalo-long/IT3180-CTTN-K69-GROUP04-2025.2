package com.kstn.group4.backend.notification;

import com.kstn.group4.backend.notification.dto.NotificationResponse;
import com.kstn.group4.backend.notification.entity.Notification;
import com.kstn.group4.backend.notification.entity.NotificationType;
import com.kstn.group4.backend.notification.repository.NotificationRepository;
import com.kstn.group4.backend.notification.service.NotificationService;
import com.kstn.group4.backend.user.entity.User;
import com.kstn.group4.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class NotificationIntegrationTest {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUsername("testplayer");
        testUser.setEmail("testplayer@test.com");
        testUser.setPassword("password");
        testUser.setRole("PLAYER");
        testUser = userRepository.save(testUser);
    }

    @Test
    void createNotificationAndRetrieveByRecipient() {
        Notification notification = new Notification();
        notification.setRecipient(testUser);
        notification.setType(NotificationType.BOOKING_STATUS);
        notification.setTitle("Booking Confirmed");
        notification.setMessage("Your booking has been confirmed.");
        notification.setTargetType("BOOKING");
        notification.setTargetId("1");
        notificationRepository.save(notification);

        Page<NotificationResponse> result = notificationService.getMyNotifications(
                testUser.getId(), PageRequest.of(0, 10));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).title()).isEqualTo("Booking Confirmed");
        assertThat(result.getContent().get(0).message()).isEqualTo("Your booking has been confirmed.");
        assertThat(result.getContent().get(0).type()).isEqualTo(NotificationType.BOOKING_STATUS.name());
        assertThat(result.getContent().get(0).id()).isNotNull();
    }

    @Test
    void countUnreadNotifications() {
        Notification unread1 = new Notification();
        unread1.setRecipient(testUser);
        unread1.setType(NotificationType.TEAM_INVITATION);
        unread1.setTitle("Team Invite");
        unread1.setMessage("You have been invited to a team.");
        unread1.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(unread1);

        Notification unread2 = new Notification();
        unread2.setRecipient(testUser);
        unread2.setType(NotificationType.MATCH_SCHEDULE);
        unread2.setTitle("Match Scheduled");
        unread2.setMessage("A match has been scheduled.");
        unread2.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(unread2);

        Notification read = new Notification();
        read.setRecipient(testUser);
        read.setType(NotificationType.BOOKING_STATUS);
        read.setTitle("Old Notification");
        read.setMessage("This is read.");
        read.setReadAt(LocalDateTime.now().minusHours(1));
        read.setCreatedAt(LocalDateTime.now().minusHours(2));
        notificationRepository.save(read);

        long unreadCount = notificationService.countUnread(testUser.getId());
        assertThat(unreadCount).isEqualTo(2);
    }

    @Test
    void markNotificationAsRead() {
        Notification notification = new Notification();
        notification.setRecipient(testUser);
        notification.setType(NotificationType.BOOKING_STATUS);
        notification.setTitle("Test Notification");
        notification.setMessage("This should be marked as read.");
        notification = notificationRepository.save(notification);

        assertThat(notification.getReadAt()).isNull();

        notificationService.markAsRead(notification.getId(), testUser.getId());

        Notification updated = notificationRepository.findById(notification.getId()).orElseThrow();
        assertThat(updated.getReadAt()).isNotNull();
    }

    @Test
    void markAllAsRead() {
        Notification n1 = new Notification();
        n1.setRecipient(testUser);
        n1.setType(NotificationType.BOOKING_STATUS);
        n1.setTitle("Notification 1");
        n1.setMessage("Message 1");
        notificationRepository.save(n1);

        Notification n2 = new Notification();
        n2.setRecipient(testUser);
        n2.setType(NotificationType.TEAM_INVITATION);
        n2.setTitle("Notification 2");
        n2.setMessage("Message 2");
        notificationRepository.save(n2);

        Notification n3 = new Notification();
        n3.setRecipient(testUser);
        n3.setType(NotificationType.MATCH_SCHEDULE);
        n3.setTitle("Notification 3");
        n3.setMessage("Message 3");
        n3.setReadAt(LocalDateTime.now().minusMinutes(10));
        notificationRepository.save(n3);

        long beforeCount = notificationService.countUnread(testUser.getId());
        assertThat(beforeCount).isEqualTo(2);

        int updated = notificationService.markAllAsRead(testUser.getId());
        assertThat(updated).isEqualTo(2);

        long afterCount = notificationService.countUnread(testUser.getId());
        assertThat(afterCount).isEqualTo(0);
    }

    @Test
    void createNotificationForUser() {
        Notification created = notificationService.createNotification(
                testUser.getId(),
                NotificationType.ADMIN_ALERT,
                "Admin Alert",
                "You have a new alert.",
                "USER",
                testUser.getId().toString()
        );

        assertThat(created).isNotNull();
        assertThat(created.getId()).isNotNull();
        assertThat(created.getTitle()).isEqualTo("Admin Alert");
        assertThat(created.getMessage()).isEqualTo("You have a new alert.");
        assertThat(created.getType()).isEqualTo(NotificationType.ADMIN_ALERT);
        assertThat(created.getRecipient().getId()).isEqualTo(testUser.getId());
    }
}
