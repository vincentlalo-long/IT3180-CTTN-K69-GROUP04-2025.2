package com.kstn.group4.backend.venue.service.player;

import com.kstn.group4.backend.booking.entity.Booking;
import com.kstn.group4.backend.booking.entity.BookingStatus;
import com.kstn.group4.backend.booking.repository.BookingRepository;
import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.venue.dto.ServiceItemResponse;
import com.kstn.group4.backend.venue.dto.player.PitchSlotsResponse;
import com.kstn.group4.backend.venue.dto.player.SlotDetailResponse;
import com.kstn.group4.backend.venue.dto.player.VenueAvailabilityResponse;
import com.kstn.group4.backend.venue.dto.player.VenueResponseDTO;
import com.kstn.group4.backend.venue.entity.AddonService;
import com.kstn.group4.backend.venue.entity.Pitch;
import com.kstn.group4.backend.venue.entity.PitchType;
import com.kstn.group4.backend.venue.entity.TimeSlot;
import com.kstn.group4.backend.venue.entity.Venue;
import com.kstn.group4.backend.venue.repository.AddonServiceRepository;
import com.kstn.group4.backend.venue.repository.PitchRepository;
import com.kstn.group4.backend.venue.repository.PitchReviewRepository;
import com.kstn.group4.backend.venue.repository.TimeSlotRepository;
import com.kstn.group4.backend.venue.repository.VenueRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
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
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VenuePlayerServiceTest {

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private PitchRepository pitchRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private TimeSlotRepository timeSlotRepository;

    @Mock
    private AddonServiceRepository addonServiceRepository;

    @Mock
    private PitchReviewRepository pitchReviewRepository;

    @InjectMocks
    private VenuePlayerService venuePlayerService;

    // --- getActiveVenues tests ---

    @Test
    void getActiveVenues_returnsMappedDTOs() {
        Pageable pageable = PageRequest.of(0, 10);
        Venue venue = createVenue(1, "Sân ABC");
        venue.setPitches(List.of(createPitch(1, "SAN_1", BigDecimal.valueOf(100000), venue)));

        Page<Venue> venuePage = new PageImpl<>(List.of(venue), pageable, 1);
        when(venueRepository.findActiveVenuesForPlayer(pageable)).thenReturn(venuePage);
        when(pitchReviewRepository.averageRatingByVenueId(1)).thenReturn(4.5);
        when(pitchReviewRepository.countByVenueId(1)).thenReturn(10L);

        Page<VenueResponseDTO> result = venuePlayerService.getActiveVenues(pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        VenueResponseDTO dto = result.getContent().get(0);
        assertEquals(1, dto.id());
        assertEquals("Sân ABC", dto.name());
        assertEquals(4.5, dto.averageRating());
        assertEquals(10L, dto.reviewCount());
        assertEquals(0, BigDecimal.valueOf(100000).compareTo(dto.minPrice()));
    }

    @Test
    void getActiveVenues_emptyResult_returnsEmptyPage() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Venue> emptyPage = new PageImpl<>(List.of(), pageable, 0);
        when(venueRepository.findActiveVenuesForPlayer(pageable)).thenReturn(emptyPage);

        Page<VenueResponseDTO> result = venuePlayerService.getActiveVenues(pageable);

        assertNotNull(result);
        assertEquals(0, result.getTotalElements());
    }

    // --- getAvailability tests ---

    @Test
    void getAvailability_withValidVenue_returnsAvailabilityWithPitches() {
        Integer venueId = 1;
        LocalDate date = LocalDate.of(2026, 6, 15);

        Venue venue = createVenue(venueId, "Sân ABC");
        Pitch pitch = createPitch(1, "SAN_1", BigDecimal.valueOf(100000), venue);
        TimeSlot timeSlot = createTimeSlot(1, 1, LocalTime.of(6, 30), LocalTime.of(8, 0));

        when(venueRepository.findById(venueId)).thenReturn(Optional.of(venue));
        when(pitchRepository.findActiveByVenueIdWithPriceRules(venueId)).thenReturn(List.of(pitch));
        when(bookingRepository.findConfirmedByVenueIdAndBookingDate(venueId, date)).thenReturn(List.of());
        when(timeSlotRepository.findAllActiveOrderBySlotNumberAsc()).thenReturn(List.of(timeSlot));

        VenueAvailabilityResponse result = venuePlayerService.getAvailability(venueId, date);

        assertNotNull(result);
        assertEquals(venueId, result.venueId());
        assertEquals("Sân ABC", result.venueName());
        assertEquals(date, result.date());
        assertFalse(result.pitches().isEmpty());
        assertEquals(1, result.pitches().size());
        assertEquals(1, result.pitches().get(0).pitchId());
    }

    @Test
    void getAvailability_withNonExistentVenue_throwsResourceNotFoundException() {
        when(venueRepository.findById(999)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> venuePlayerService.getAvailability(999, LocalDate.of(2026, 6, 15)));
    }

    @Test
    void getAvailability_withBookedSlots_showsCorrectStatus() {
        Integer venueId = 1;
        LocalDate date = LocalDate.of(2026, 6, 15);

        Venue venue = createVenue(venueId, "Sân ABC");
        Pitch pitch = createPitch(1, "SAN_1", BigDecimal.valueOf(100000), venue);
        TimeSlot timeSlot = createTimeSlot(1, 1, LocalTime.of(6, 30), LocalTime.of(8, 0));

        Booking booking = new Booking();
        booking.setPitch(pitch);
        booking.setTimeSlot(timeSlot);
        booking.setStatus(BookingStatus.CONFIRMED);

        when(venueRepository.findById(venueId)).thenReturn(Optional.of(venue));
        when(pitchRepository.findActiveByVenueIdWithPriceRules(venueId)).thenReturn(List.of(pitch));
        when(bookingRepository.findConfirmedByVenueIdAndBookingDate(venueId, date)).thenReturn(List.of(booking));
        when(timeSlotRepository.findAllActiveOrderBySlotNumberAsc()).thenReturn(List.of(timeSlot));

        VenueAvailabilityResponse result = venuePlayerService.getAvailability(venueId, date);

        assertNotNull(result);
        assertFalse(result.pitches().isEmpty());
        assertEquals("BOOKED", result.pitches().get(0).slots().get(0).status());
    }

    // --- getPitchSlots tests ---

    @Test
    void getPitchSlots_withFilterAll_returnsAllSlots() {
        Integer pitchId = 1;
        LocalDate date = LocalDate.of(2026, 6, 15);

        Venue venue = createVenue(1, "Sân ABC");
        Pitch pitch = createPitch(pitchId, "SAN_1", BigDecimal.valueOf(100000), venue);
        TimeSlot ts1 = createTimeSlot(1, 1, LocalTime.of(6, 30), LocalTime.of(8, 0));
        TimeSlot ts2 = createTimeSlot(2, 2, LocalTime.of(8, 0), LocalTime.of(9, 30));

        when(pitchRepository.findById(pitchId)).thenReturn(Optional.of(pitch));
        when(timeSlotRepository.findAllActiveOrderBySlotNumberAsc()).thenReturn(List.of(ts1, ts2));
        when(bookingRepository.findConfirmedByPitchIdAndBookingDate(pitchId, date)).thenReturn(List.of());

        PitchSlotsResponse result = venuePlayerService.getPitchSlots(pitchId, date, "all");

        assertNotNull(result);
        assertEquals(pitchId, result.pitchId());
        assertEquals("SAN_1", result.pitchName());
        assertEquals(date, result.bookingDate());
        assertEquals(2, result.slots().size());
        assertTrue(result.slots().stream().allMatch(s -> "AVAILABLE".equals(s.status())));
    }

    @Test
    void getPitchSlots_withFilterAvailable_returnsOnlyAvailable() {
        Integer pitchId = 1;
        LocalDate date = LocalDate.of(2026, 6, 15);

        Venue venue = createVenue(1, "Sân ABC");
        Pitch pitch = createPitch(pitchId, "SAN_1", BigDecimal.valueOf(100000), venue);
        TimeSlot ts1 = createTimeSlot(1, 1, LocalTime.of(6, 30), LocalTime.of(8, 0));
        TimeSlot ts2 = createTimeSlot(2, 2, LocalTime.of(8, 0), LocalTime.of(9, 30));

        Booking booking = new Booking();
        booking.setPitch(pitch);
        booking.setTimeSlot(ts1);
        booking.setStatus(BookingStatus.CONFIRMED);

        when(pitchRepository.findById(pitchId)).thenReturn(Optional.of(pitch));
        when(timeSlotRepository.findAllActiveOrderBySlotNumberAsc()).thenReturn(List.of(ts1, ts2));
        when(bookingRepository.findConfirmedByPitchIdAndBookingDate(pitchId, date)).thenReturn(List.of(booking));

        PitchSlotsResponse result = venuePlayerService.getPitchSlots(pitchId, date, "available");

        assertNotNull(result);
        assertEquals(1, result.slots().size());
        assertEquals(2, result.slots().get(0).slotNumber());
        assertEquals("AVAILABLE", result.slots().get(0).status());
    }

    @Test
    void getPitchSlots_withFilterOccupied_returnsOnlyOccupied() {
        Integer pitchId = 1;
        LocalDate date = LocalDate.of(2026, 6, 15);

        Venue venue = createVenue(1, "Sân ABC");
        Pitch pitch = createPitch(pitchId, "SAN_1", BigDecimal.valueOf(100000), venue);
        TimeSlot ts1 = createTimeSlot(1, 1, LocalTime.of(6, 30), LocalTime.of(8, 0));
        TimeSlot ts2 = createTimeSlot(2, 2, LocalTime.of(8, 0), LocalTime.of(9, 30));

        Booking booking = new Booking();
        booking.setPitch(pitch);
        booking.setTimeSlot(ts1);
        booking.setStatus(BookingStatus.CONFIRMED);

        when(pitchRepository.findById(pitchId)).thenReturn(Optional.of(pitch));
        when(timeSlotRepository.findAllActiveOrderBySlotNumberAsc()).thenReturn(List.of(ts1, ts2));
        when(bookingRepository.findConfirmedByPitchIdAndBookingDate(pitchId, date)).thenReturn(List.of(booking));

        PitchSlotsResponse result = venuePlayerService.getPitchSlots(pitchId, date, "occupied");

        assertNotNull(result);
        assertEquals(1, result.slots().size());
        assertEquals(1, result.slots().get(0).slotNumber());
        assertEquals("BOOKED", result.slots().get(0).status());
    }

    @Test
    void getPitchSlots_withNonExistentPitch_throwsResourceNotFoundException() {
        when(pitchRepository.findById(999)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> venuePlayerService.getPitchSlots(999, LocalDate.of(2026, 6, 15), "all"));
    }

    @Test
    void getPitchSlots_withNullFilter_defaultsToAll() {
        Integer pitchId = 1;
        LocalDate date = LocalDate.of(2026, 6, 15);

        Venue venue = createVenue(1, "Sân ABC");
        Pitch pitch = createPitch(pitchId, "SAN_1", BigDecimal.valueOf(100000), venue);
        TimeSlot ts1 = createTimeSlot(1, 1, LocalTime.of(6, 30), LocalTime.of(8, 0));

        when(pitchRepository.findById(pitchId)).thenReturn(Optional.of(pitch));
        when(timeSlotRepository.findAllActiveOrderBySlotNumberAsc()).thenReturn(List.of(ts1));
        when(bookingRepository.findConfirmedByPitchIdAndBookingDate(pitchId, date)).thenReturn(List.of());

        PitchSlotsResponse result = venuePlayerService.getPitchSlots(pitchId, date, null);

        assertNotNull(result);
        assertEquals(1, result.slots().size());
    }

    // --- getActiveServices tests ---

    @Test
    void getActiveServices_returnsServicesList() {
        Integer venueId = 1;
        Venue venue = createVenue(venueId, "Sân ABC");
        AddonService service = createAddonService(1, "Nước uống", BigDecimal.valueOf(10000), venue);

        when(venueRepository.existsById(venueId)).thenReturn(true);
        when(addonServiceRepository.findActiveByVenueIdIncludingPitch(venueId, "ACTIVE"))
                .thenReturn(List.of(service));

        List<ServiceItemResponse> result = venuePlayerService.getActiveServices(venueId);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Nước uống", result.get(0).name());
        assertEquals(venueId, result.get(0).venueId());
    }

    @Test
    void getActiveServices_emptyList_returnsEmpty() {
        Integer venueId = 1;
        when(venueRepository.existsById(venueId)).thenReturn(true);
        when(addonServiceRepository.findActiveByVenueIdIncludingPitch(venueId, "ACTIVE"))
                .thenReturn(List.of());

        List<ServiceItemResponse> result = venuePlayerService.getActiveServices(venueId);

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void getActiveServices_withNonExistentVenue_throwsResourceNotFoundException() {
        when(venueRepository.existsById(999)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class,
                () -> venuePlayerService.getActiveServices(999));
        verify(addonServiceRepository, never()).findActiveByVenueIdIncludingPitch(any(), anyString());
    }

    // --- Helper methods ---

    private Venue createVenue(Integer id, String name) {
        Venue venue = new Venue();
        venue.setId(id);
        venue.setName(name);
        venue.setAddress("123 Đường ABC");
        venue.setDescription("Mô tả");
        venue.setManagerId(1);
        venue.setOpenTime(LocalTime.of(6, 30));
        venue.setCloseTime(LocalTime.of(23, 0));
        venue.setPitches(new java.util.ArrayList<>());
        return venue;
    }

    private Pitch createPitch(Integer id, String name, BigDecimal basePrice, Venue venue) {
        Pitch pitch = new Pitch();
        pitch.setId(id);
        pitch.setName(name);
        pitch.setPitchType(PitchType.SAN_5);
        pitch.setIsActive(true);
        pitch.setBasePrice(basePrice);
        pitch.setVenue(venue);
        pitch.setPriceRules(new java.util.ArrayList<>());
        venue.getPitches().add(pitch);
        return pitch;
    }

    private TimeSlot createTimeSlot(Integer id, Integer slotNumber, LocalTime startTime, LocalTime endTime) {
        TimeSlot ts = new TimeSlot();
        ts.setId(id);
        ts.setSlotNumber(slotNumber);
        ts.setStartTime(startTime);
        ts.setEndTime(endTime);
        ts.setIsActive(true);
        return ts;
    }

    private AddonService createAddonService(Integer id, String name, BigDecimal price, Venue venue) {
        AddonService service = new AddonService();
        service.setId(id);
        service.setName(name);
        service.setPrice(price);
        service.setUnit("chai");
        service.setStatus("ACTIVE");
        service.setVenue(venue);
        return service;
    }
}
