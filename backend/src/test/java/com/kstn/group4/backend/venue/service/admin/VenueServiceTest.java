package com.kstn.group4.backend.venue.service.admin;

import com.kstn.group4.backend.activitylog.service.ActivityLogService;
import com.kstn.group4.backend.booking.repository.BookingRepository;
import com.kstn.group4.backend.config.security.services.UserPrincipal;
import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.venue.dto.admin.VenueDetailResponse;
import com.kstn.group4.backend.venue.entity.Pitch;
import com.kstn.group4.backend.venue.entity.PitchType;
import com.kstn.group4.backend.venue.entity.Venue;
import com.kstn.group4.backend.venue.repository.PitchRepository;
import com.kstn.group4.backend.venue.repository.VenueRepository;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class VenueServiceTest {

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private PitchRepository pitchRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ActivityLogService activityLogService;

    private VenueService venueService;

    @BeforeEach
    void setUp() {
        venueService = new VenueService(venueRepository, pitchRepository, bookingRepository, activityLogService);
        setupSecurityContext();
    }

    private void setupSecurityContext() {
        UserPrincipal principal = new UserPrincipal(1, "admin@example.com", "admin", "admin@example.com", "password", "ADMIN", List.of());
        Authentication auth = org.mockito.Mockito.mock(Authentication.class);
        org.mockito.Mockito.when(auth.isAuthenticated()).thenReturn(true);
        org.mockito.Mockito.when(auth.getPrincipal()).thenReturn(principal);
        SecurityContext securityContext = org.mockito.Mockito.mock(SecurityContext.class);
        org.mockito.Mockito.when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);
    }

    // --- createVenue tests ---

    @Test
    void createVenue_withNullTimes_setsDefaultOpenCloseTimes() {
        Venue request = new Venue();
        request.setName("Sân mới");
        request.setAddress("123 Đường ABC");
        request.setManagerId(1);

        when(venueRepository.save(any(Venue.class))).thenAnswer(invocation -> {
            Venue venue = invocation.getArgument(0);
            venue.setId(1);
            return venue;
        });

        VenueDetailResponse response = venueService.createVenue(request);

        assertNotNull(response);
        assertEquals(1, response.id());
        assertEquals("Sân mới", response.name());
        assertEquals(LocalTime.of(6, 30), response.openTime());
        assertEquals(LocalTime.of(23, 0), response.closeTime());
        verify(activityLogService).log(anyInt(), anyString(), eq("CREATE_VENUE"), eq("VENUE"), anyString(), anyString(), any(), any());
    }

    @Test
    void createVenue_withExplicitTimes_keepsProvidedTimes() {
        Venue request = new Venue();
        request.setName("Sân mới");
        request.setOpenTime(LocalTime.of(7, 0));
        request.setCloseTime(LocalTime.of(22, 0));

        when(venueRepository.save(any(Venue.class))).thenAnswer(invocation -> {
            Venue venue = invocation.getArgument(0);
            venue.setId(1);
            return venue;
        });

        VenueDetailResponse response = venueService.createVenue(request);

        assertNotNull(response);
        assertEquals(LocalTime.of(7, 0), response.openTime());
        assertEquals(LocalTime.of(22, 0), response.closeTime());
    }

    @Test
    void createVenue_savesAndReturnsResponse() {
        Venue request = new Venue();
        request.setName("Sân bóng đá");

        when(venueRepository.save(any(Venue.class))).thenAnswer(invocation -> {
            Venue venue = invocation.getArgument(0);
            venue.setId(42);
            return venue;
        });

        VenueDetailResponse response = venueService.createVenue(request);

        assertNotNull(response);
        assertEquals(42, response.id());
        assertEquals("Sân bóng đá", response.name());
        verify(venueRepository).save(request);
    }

    // --- getVenueById tests ---

    @Test
    void getVenueById_withValidId_returnsVenue() {
        Venue venue = createVenueWithPitches(1, "Sân ABC");

        when(venueRepository.findByIdWithPitches(1)).thenReturn(Optional.of(venue));

        VenueDetailResponse response = venueService.getVenueById(1);

        assertNotNull(response);
        assertEquals(1, response.id());
        assertEquals("Sân ABC", response.name());
        assertEquals(2, response.pitches().size());
    }

    @Test
    void getVenueById_withInvalidId_throwsResourceNotFoundException() {
        when(venueRepository.findByIdWithPitches(999)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> venueService.getVenueById(999));
    }

    // --- updateVenue tests ---

    @Test
    void updateVenue_updatesFieldsCorrectly() {
        Venue existing = createVenueWithPitches(1, "Old Name");
        Venue request = new Venue();
        request.setName("New Name");
        request.setAddress("New Address");
        request.setDescription("New Description");
        request.setManagerId(2);

        when(venueRepository.findById(1)).thenReturn(Optional.of(existing));
        when(venueRepository.save(any(Venue.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VenueDetailResponse response = venueService.updateVenue(1, request);

        assertNotNull(response);
        assertEquals("New Name", response.name());
        assertEquals("New Address", response.address());
        assertEquals("New Description", response.description());
        assertEquals(2, response.managerId());
        verify(activityLogService).log(anyInt(), anyString(), eq("UPDATE_VENUE"), eq("VENUE"), anyString(), anyString(), any(), any());
    }

    @Test
    void updateVenue_withNonExistentId_throwsResourceNotFoundException() {
        Venue request = new Venue();
        request.setName("Updated");

        when(venueRepository.findById(999)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> venueService.updateVenue(999, request));
        verify(venueRepository, never()).save(any());
    }

    @Test
    void updateVenue_withNullTimes_keepsExistingTimes() {
        Venue existing = createVenueWithPitches(1, "Sân ABC");
        existing.setOpenTime(LocalTime.of(7, 0));
        existing.setCloseTime(LocalTime.of(22, 0));

        Venue request = new Venue();
        request.setName("Updated Name");
        request.setOpenTime(null);
        request.setCloseTime(null);

        when(venueRepository.findById(1)).thenReturn(Optional.of(existing));
        when(venueRepository.save(any(Venue.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VenueDetailResponse response = venueService.updateVenue(1, request);

        assertNotNull(response);
        assertEquals(LocalTime.of(7, 0), response.openTime());
        assertEquals(LocalTime.of(22, 0), response.closeTime());
    }

    // --- deleteVenue tests ---

    @Test
    void deleteVenue_withValidId_succeeds() {
        when(venueRepository.existsById(1)).thenReturn(true);
        doNothing().when(venueRepository).deleteById(1);

        venueService.deleteVenue(1);

        verify(venueRepository).deleteById(1);
        verify(activityLogService).log(anyInt(), anyString(), eq("DELETE_VENUE"), eq("VENUE"), anyString(), anyString(), any(), any());
    }

    @Test
    void deleteVenue_withInvalidId_throwsResourceNotFoundException() {
        when(venueRepository.existsById(999)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> venueService.deleteVenue(999));
        verify(venueRepository, never()).deleteById(anyInt());
    }

    // --- getVenueByIdForAdmin tests ---

    @Test
    void getVenueByIdForAdmin_withValidId_returnsAdminDTO() {
        Venue venue = createVenueWithPitches(1, "Sân ABC");

        when(venueRepository.findById(1)).thenReturn(Optional.of(venue));
        when(pitchRepository.countByVenueId(1)).thenReturn(2L);

        var result = venueService.getVenueByIdForAdmin(1);

        assertNotNull(result);
        assertEquals(1, result.id());
        assertEquals("Sân ABC", result.name());
        assertEquals(2L, result.totalPitches());
    }

    @Test
    void getVenueByIdForAdmin_withInvalidId_throwsResourceNotFoundException() {
        when(venueRepository.findById(999)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> venueService.getVenueByIdForAdmin(999));
    }

    // --- Helper methods ---

    private Venue createVenueWithPitches(Integer id, String name) {
        Venue venue = new Venue();
        venue.setId(id);
        venue.setName(name);
        venue.setAddress("123 Đường ABC");
        venue.setDescription("Mô tả sân");
        venue.setManagerId(1);
        venue.setOpenTime(LocalTime.of(6, 30));
        venue.setCloseTime(LocalTime.of(23, 0));

        Pitch pitch1 = new Pitch();
        pitch1.setId(1);
        pitch1.setName("SAN_1");
        pitch1.setPitchType(PitchType.SAN_5);
        pitch1.setIsActive(true);
        pitch1.setVenue(venue);

        Pitch pitch2 = new Pitch();
        pitch2.setId(2);
        pitch2.setName("SAN_2");
        pitch2.setPitchType(PitchType.SAN_7);
        pitch2.setIsActive(true);
        pitch2.setVenue(venue);

        venue.setPitches(new java.util.ArrayList<>(List.of(pitch1, pitch2)));
        return venue;
    }
}
