package com.kstn.group4.backend.notification.listener;

import com.kstn.group4.backend.booking.entity.BookingStatus;
import com.kstn.group4.backend.notification.entity.NotificationType;
import com.kstn.group4.backend.notification.event.BookingStatusChangedEvent;
import com.kstn.group4.backend.notification.event.MatchScheduleChangedEvent;
import com.kstn.group4.backend.notification.event.TeamInvitationCreatedEvent;
import com.kstn.group4.backend.notification.service.NotificationService;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashSet;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATE_TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");

    private final NotificationService notificationService;

    @EventListener
    public void handleBookingStatusChanged(BookingStatusChangedEvent event) {
        if (event.getNewStatus() == BookingStatus.BOOKED) {
            notificationService.createNotification(
                    event.getRecipientId(),
                    NotificationType.BOOKING_STATUS,
                    "Đơn đặt sân đã được duyệt",
                    buildBookingMessage(event, "đã được duyệt"),
                    "BOOKING",
                    event.getBookingId().toString()
            );
            return;
        }

        if (event.getNewStatus() == BookingStatus.CANCELLED) {
            notificationService.createNotification(
                    event.getRecipientId(),
                    NotificationType.BOOKING_STATUS,
                    "Đơn đặt sân đã bị hủy",
                    buildBookingMessage(event, "đã bị hủy"),
                    "BOOKING",
                    event.getBookingId().toString()
            );
        }
    }

    @EventListener
    public void handleTeamInvitationCreated(TeamInvitationCreatedEvent event) {
        notificationService.createNotification(
                event.getRecipientId(),
                NotificationType.TEAM_INVITATION,
                "Lời mời vào đội bóng",
                "Bạn được mời vào đội " + event.getTeamName() + " bởi " + event.getCaptainName() + ".",
                "TEAM",
                event.getTeamId().toString()
        );
    }

    @EventListener
    public void handleMatchScheduleChanged(MatchScheduleChangedEvent event) {
        Set<Long> teamIds = new LinkedHashSet<>(event.getTeamIds());
        String title = "CANCELLED".equals(event.getChangeType())
                ? "Lịch thi đấu đã bị hủy"
                : "Lịch thi đấu đã cập nhật";
        String message = "Trận đấu tại " + event.getVenueName()
                + " lúc " + event.getMatchTime().format(DATE_TIME_FORMAT)
                + ("CANCELLED".equals(event.getChangeType()) ? " đã bị hủy." : " đã được xếp lịch.");

        for (Long teamId : teamIds) {
            notificationService.createNotificationsForTeam(
                    teamId,
                    NotificationType.MATCH_SCHEDULE,
                    title,
                    message,
                    "MATCH",
                    event.getMatchId().toString()
            );
        }
    }

    private String buildBookingMessage(BookingStatusChangedEvent event, String statusText) {
        return "Đơn #" + event.getBookingId()
                + " tại " + event.getPitchName()
                + " ngày " + event.getBookingDate().format(DATE_FORMAT)
                + " lúc " + event.getStartTime().format(TIME_FORMAT)
                + " " + statusText + ".";
    }
}
