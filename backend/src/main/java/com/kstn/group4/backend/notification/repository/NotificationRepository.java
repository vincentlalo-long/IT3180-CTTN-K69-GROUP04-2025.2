package com.kstn.group4.backend.notification.repository;

import com.kstn.group4.backend.notification.entity.Notification;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByRecipient_IdOrderByCreatedAtDesc(Integer recipientId, Pageable pageable);

    long countByRecipient_IdAndReadAtIsNull(Integer recipientId);

    Optional<Notification> findByIdAndRecipient_Id(Long id, Integer recipientId);

    @Modifying
    @Query("""
            UPDATE Notification n
            SET n.readAt = :readAt
            WHERE n.recipient.id = :recipientId
            AND n.readAt IS NULL
            """)
    int markAllAsRead(@Param("recipientId") Integer recipientId, @Param("readAt") LocalDateTime readAt);
}
