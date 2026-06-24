package com.kstn.group4.backend.match;

import com.kstn.group4.backend.booking.entity.Booking;
import com.kstn.group4.backend.booking.entity.BookingStatus;
import com.kstn.group4.backend.booking.repository.BookingRepository;
import com.kstn.group4.backend.match.entity.Match;
import com.kstn.group4.backend.match.enums.MatchStatus;
import com.kstn.group4.backend.match.listener.MatchBookingEventListener;
import com.kstn.group4.backend.match.repository.MatchRepository;
import com.kstn.group4.backend.notification.entity.NotificationType;
import com.kstn.group4.backend.notification.event.BookingStatusChangedEvent;
import com.kstn.group4.backend.notification.service.NotificationService;
import com.kstn.group4.backend.team.entity.Team;
import com.kstn.group4.backend.user.entity.User;
import com.kstn.group4.backend.venue.entity.Pitch;
import com.kstn.group4.backend.venue.entity.PitchType;
import com.kstn.group4.backend.venue.entity.TimeSlot;
import com.kstn.group4.backend.venue.entity.Venue;
import com.kstn.group4.backend.venue.repository.PitchRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MatchBookingEventListenerTest {

    @Mock
    private MatchRepository matchRepository;

    @Mock
    private PitchRepository pitchRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private NotificationService notificationService;

    private MatchBookingEventListener listener;

    @BeforeEach
    void setUp() {
        listener = new MatchBookingEventListener(matchRepository, pitchRepository, bookingRepository, notificationService);
    }

    @Test
    void handleBookingStatusChanged_otherStatus_doesNothing() {
        BookingStatusChangedEvent event = new BookingStatusChangedEvent(
                1, 2, BookingStatus.PENDING, BookingStatus.RESERVED, "San 5 A",
                LocalDate.now(), LocalTime.of(17, 0)
        );

        listener.handleBookingStatusChanged(event);

        verifyNoInteractions(bookingRepository, pitchRepository, matchRepository, notificationService);
    }

    @Test
    void handleBookingStatusChanged_noPitchesAvailable_cancelsOpenMatchesAndSendsNotification() {
        LocalDate date = LocalDate.of(2026, 6, 20);
        LocalTime startTime = LocalTime.of(17, 0);

        Venue venue = new Venue();
        venue.setId(1);
        venue.setName("Cụm Sân Mixi");

        Pitch pitch = new Pitch();
        pitch.setId(10);
        pitch.setPitchType(PitchType.SAN_5);
        pitch.setVenue(venue);

        TimeSlot slot = new TimeSlot();
        slot.setId(2);

        Booking booking = new Booking();
        booking.setId(100);
        booking.setPitch(pitch);
        booking.setTimeSlot(slot);
        booking.setBookingDate(date);
        booking.setStartTime(startTime);

        User captain = new User();
        captain.setId(42);

        Team hostTeam = new Team();
        hostTeam.setId(5L);
        hostTeam.setCaptain(captain);

        Match match = new Match();
        match.setId(200);
        match.setStatus(MatchStatus.OPEN);
        match.setVenue(venue);
        match.setTimeSlot(slot);
        match.setPitchType(5);
        match.setHostTeam(hostTeam);
        match.setMatchTime(LocalDateTime.of(date, startTime));

        BookingStatusChangedEvent event = new BookingStatusChangedEvent(
                100, 2, BookingStatus.RESERVED, BookingStatus.BOOKED, "San 5 A",
                date, startTime
        );

        when(bookingRepository.findByIdWithDetails(100)).thenReturn(Optional.of(booking));
        when(pitchRepository.findAvailablePitches(1, PitchType.SAN_5, date, 2))
                .thenReturn(Collections.emptyList()); // No pitches available
        when(matchRepository.findOpenMatchesToAutoCancel(eq(1), eq(2), eq(5), any(), any()))
                .thenReturn(List.of(match));

        listener.handleBookingStatusChanged(event);

        assertEquals(MatchStatus.CANCELLED, match.getStatus());
        verify(matchRepository).save(match);
        verify(notificationService).createNotification(
                eq(42),
                eq(NotificationType.MATCH_SCHEDULE),
                eq("Kèo đấu bị hủy tự động"),
                contains("Cụm Sân Mixi"),
                eq("MATCH"),
                eq("200")
        );
    }

    @Test
    void handleBookingStatusChanged_pitchesStillAvailable_doesNotCancelMatches() {
        LocalDate date = LocalDate.of(2026, 6, 20);
        LocalTime startTime = LocalTime.of(17, 0);

        Venue venue = new Venue();
        venue.setId(1);

        Pitch pitch = new Pitch();
        pitch.setId(10);
        pitch.setPitchType(PitchType.SAN_5);
        pitch.setVenue(venue);

        TimeSlot slot = new TimeSlot();
        slot.setId(2);

        Booking booking = new Booking();
        booking.setId(100);
        booking.setPitch(pitch);
        booking.setTimeSlot(slot);
        booking.setBookingDate(date);
        booking.setStartTime(startTime);

        BookingStatusChangedEvent event = new BookingStatusChangedEvent(
                100, 2, BookingStatus.RESERVED, BookingStatus.BOOKED, "San 5 A",
                date, startTime
        );

        when(bookingRepository.findByIdWithDetails(100)).thenReturn(Optional.of(booking));
        when(pitchRepository.findAvailablePitches(1, PitchType.SAN_5, date, 2))
                .thenReturn(List.of(new Pitch())); // Pitch is still available

        listener.handleBookingStatusChanged(event);

        verifyNoMoreInteractions(matchRepository, notificationService);
    }

    @Test
    void handleBookingStatusChanged_cancelledMatchAutoBooking_cancelsScheduledMatchesAndNotifiesBothCaptains() {
        LocalDate date = LocalDate.of(2026, 6, 20);
        LocalTime startTime = LocalTime.of(17, 0);

        Venue venue = new Venue();
        venue.setId(1);
        venue.setName("Cụm Sân Mixi");

        Pitch pitch = new Pitch();
        pitch.setId(10);
        pitch.setPitchType(PitchType.SAN_5);
        pitch.setVenue(venue);

        TimeSlot slot = new TimeSlot();
        slot.setId(2);

        User hostCaptain = new User();
        hostCaptain.setId(42);

        User guestCaptain = new User();
        guestCaptain.setId(43);

        Booking booking = new Booking();
        booking.setId(100);
        booking.setPitch(pitch);
        booking.setTimeSlot(slot);
        booking.setBookingDate(date);
        booking.setStartTime(startTime);
        booking.setBookingType("MATCH_AUTO");
        booking.setPlayer(hostCaptain);

        Team hostTeam = new Team();
        hostTeam.setId(5L);
        hostTeam.setCaptain(hostCaptain);

        Team guestTeam = new Team();
        guestTeam.setId(6L);
        guestTeam.setCaptain(guestCaptain);

        Match match = new Match();
        match.setId(200);
        match.setStatus(MatchStatus.SCHEDULED);
        match.setVenue(venue);
        match.setTimeSlot(slot);
        match.setPitchType(5);
        match.setHostTeam(hostTeam);
        match.setGuestTeam(guestTeam);
        match.setMatchTime(LocalDateTime.of(date, startTime));

        BookingStatusChangedEvent event = new BookingStatusChangedEvent(
                100, 42, BookingStatus.RESERVED, BookingStatus.CANCELLED, "San 5 A",
                date, startTime
        );

        when(bookingRepository.findByIdWithDetails(100)).thenReturn(Optional.of(booking));
        when(matchRepository.findScheduledMatchesForBooking(eq(1), eq(2), eq(42), any(), any()))
                .thenReturn(List.of(match));

        listener.handleBookingStatusChanged(event);

        assertEquals(MatchStatus.CANCELLED, match.getStatus());
        verify(matchRepository).save(match);
        verify(notificationService).createNotification(
                eq(42),
                eq(NotificationType.MATCH_SCHEDULE),
                eq("Trận đấu bị hủy"),
                contains("bị hủy do đơn đặt sân tương ứng bị hủy"),
                eq("MATCH"),
                eq("200")
        );
        verify(notificationService).createNotification(
                eq(43),
                eq(NotificationType.MATCH_SCHEDULE),
                eq("Trận đấu đối kèo bị hủy"),
                contains("bị hủy do đội chủ nhà hủy đơn đặt sân"),
                eq("MATCH"),
                eq("200")
        );
    }
}
