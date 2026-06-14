package com.kstn.group4.backend.match.listener;

import com.kstn.group4.backend.booking.entity.Booking;
import com.kstn.group4.backend.booking.entity.BookingStatus;
import com.kstn.group4.backend.booking.repository.BookingRepository;
import com.kstn.group4.backend.match.entity.Match;
import com.kstn.group4.backend.match.enums.MatchStatus;
import com.kstn.group4.backend.match.repository.MatchRepository;
import com.kstn.group4.backend.notification.entity.NotificationType;
import com.kstn.group4.backend.notification.event.BookingStatusChangedEvent;
import com.kstn.group4.backend.notification.service.NotificationService;
import com.kstn.group4.backend.venue.entity.Pitch;
import com.kstn.group4.backend.venue.entity.PitchType;
import com.kstn.group4.backend.venue.repository.PitchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class MatchBookingEventListener {

    private final MatchRepository matchRepository;
    private final PitchRepository pitchRepository;
    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    @EventListener
    @Transactional
    public void handleBookingStatusChanged(BookingStatusChangedEvent event) {
        if (event.getNewStatus() == BookingStatus.BOOKED || event.getNewStatus() == BookingStatus.CONFIRMED) {
            handleBookingConfirmedOrBooked(event);
        } else if (event.getNewStatus() == BookingStatus.CANCELLED) {
            handleBookingCancelled(event);
        }
    }

    private void handleBookingConfirmedOrBooked(BookingStatusChangedEvent event) {
        log.info("BookingStatusChangedEvent received for bookingId={}, status={}", event.getBookingId(), event.getNewStatus());

        Booking booking = bookingRepository.findByIdWithDetails(event.getBookingId()).orElse(null);
        if (booking == null || booking.getPitch() == null || booking.getPitch().getVenue() == null || booking.getTimeSlot() == null) {
            return;
        }

        Integer venueId = booking.getPitch().getVenue().getId();
        PitchType pitchType = booking.getPitch().getPitchType();
        LocalDate bookingDate = booking.getBookingDate();
        Integer timeSlotId = booking.getTimeSlot().getId();

        // 1. Check if there are any active, available pitches left of this type
        List<Pitch> availablePitches = pitchRepository.findAvailablePitches(
                venueId,
                pitchType,
                bookingDate,
                timeSlotId
        );

        // If no available pitches are left, we must cancel any OPEN matches for this slot
        if (availablePitches.isEmpty()) {
            Integer pitchTypeInt = mapPitchTypeToInt(pitchType);
            LocalDateTime startDateTime = bookingDate.atStartOfDay();
            LocalDateTime endDateTime = bookingDate.atTime(LocalTime.MAX);

            List<Match> openMatches = matchRepository.findOpenMatchesToAutoCancel(
                    venueId,
                    timeSlotId,
                    pitchTypeInt,
                    startDateTime,
                    endDateTime
            );

            if (!openMatches.isEmpty()) {
                log.info("Auto-cancelling {} OPEN matches because slot is fully booked for venueId={}, pitchType={}, date={}, timeSlotId={}",
                        openMatches.size(), venueId, pitchType, bookingDate, timeSlotId);

                DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");

                for (Match match : openMatches) {
                    match.setStatus(MatchStatus.CANCELLED);
                    matchRepository.save(match);

                    // Notify host team captain
                    if (match.getHostTeam() != null && match.getHostTeam().getCaptain() != null) {
                        String matchTimeStr = match.getMatchTime() != null ? match.getMatchTime().format(dateTimeFormatter) : "N/A";
                        String message = String.format("Kèo đấu của bạn tại cụm sân %s lúc %s đã bị hủy tự động do không còn sân trống loại %d.",
                                booking.getPitch().getVenue().getName(), matchTimeStr, pitchTypeInt);

                        notificationService.createNotification(
                                match.getHostTeam().getCaptain().getId(),
                                NotificationType.MATCH_SCHEDULE,
                                "Kèo đấu bị hủy tự động",
                                message,
                                "MATCH",
                                match.getId().toString()
                        );
                    }
                }
            }
        }
    }

    private void handleBookingCancelled(BookingStatusChangedEvent event) {
        log.info("BookingStatusChangedEvent received for CANCELLED bookingId={}", event.getBookingId());

        Booking booking = bookingRepository.findByIdWithDetails(event.getBookingId()).orElse(null);
        if (booking == null || !"MATCH_AUTO".equals(booking.getBookingType())) {
            return;
        }

        if (booking.getPitch() == null || booking.getPitch().getVenue() == null || booking.getTimeSlot() == null || booking.getPlayer() == null) {
            return;
        }

        Integer venueId = booking.getPitch().getVenue().getId();
        Integer timeSlotId = booking.getTimeSlot().getId();
        LocalDate bookingDate = booking.getBookingDate();
        Integer captainId = booking.getPlayer().getId();

        LocalDateTime startDateTime = bookingDate.atStartOfDay();
        LocalDateTime endDateTime = bookingDate.atTime(LocalTime.MAX);

        List<Match> scheduledMatches = matchRepository.findScheduledMatchesForBooking(
                venueId,
                timeSlotId,
                captainId,
                startDateTime,
                endDateTime
        );

        if (!scheduledMatches.isEmpty()) {
            DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");

            for (Match match : scheduledMatches) {
                match.setStatus(MatchStatus.CANCELLED);
                matchRepository.save(match);

                log.info("Transitioned match ID {} from SCHEDULED to CANCELLED due to cancelled booking ID {}", match.getId(), booking.getId());

                // Notify host team captain
                if (match.getHostTeam() != null && match.getHostTeam().getCaptain() != null) {
                    String matchTimeStr = match.getMatchTime() != null ? match.getMatchTime().format(dateTimeFormatter) : "N/A";
                    String message = String.format("Trận đấu của bạn tại cụm sân %s lúc %s đã bị hủy do đơn đặt sân tương ứng bị hủy hoặc quá hạn thanh toán.",
                            booking.getPitch().getVenue().getName(), matchTimeStr);

                    notificationService.createNotification(
                            match.getHostTeam().getCaptain().getId(),
                            NotificationType.MATCH_SCHEDULE,
                            "Trận đấu bị hủy",
                            message,
                            "MATCH",
                            match.getId().toString()
                    );
                }

                // Notify guest team captain
                if (match.getGuestTeam() != null && match.getGuestTeam().getCaptain() != null) {
                    String matchTimeStr = match.getMatchTime() != null ? match.getMatchTime().format(dateTimeFormatter) : "N/A";
                    String message = String.format("Trận đấu đối kèo của bạn tại cụm sân %s lúc %s đã bị hủy do đội chủ nhà hủy đơn đặt sân hoặc quá hạn thanh toán.",
                            booking.getPitch().getVenue().getName(), matchTimeStr);

                    notificationService.createNotification(
                            match.getGuestTeam().getCaptain().getId(),
                            NotificationType.MATCH_SCHEDULE,
                            "Trận đấu đối kèo bị hủy",
                            message,
                            "MATCH",
                            match.getId().toString()
                    );
                }
            }
        }
    }

    private Integer mapPitchTypeToInt(PitchType pitchType) {
        if (pitchType == null) return 5;
        return switch (pitchType) {
            case SAN_7 -> 7;
            case SAN_11 -> 11;
            default -> 5;
        };
    }
}
