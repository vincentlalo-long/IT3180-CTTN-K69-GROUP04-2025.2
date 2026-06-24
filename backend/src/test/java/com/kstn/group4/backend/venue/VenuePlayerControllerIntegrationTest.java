package com.kstn.group4.backend.venue;

import com.kstn.group4.backend.config.security.jwt.JwtTokenProvider;
import com.kstn.group4.backend.config.security.services.UserPrincipal;
import com.kstn.group4.backend.user.entity.User;
import com.kstn.group4.backend.user.repository.UserRepository;
import com.kstn.group4.backend.venue.controller.VenuePlayerController;
import com.kstn.group4.backend.venue.entity.AddonService;
import com.kstn.group4.backend.venue.entity.Pitch;
import com.kstn.group4.backend.venue.entity.PitchType;
import com.kstn.group4.backend.venue.entity.TimeSlot;
import com.kstn.group4.backend.venue.entity.Venue;
import com.kstn.group4.backend.venue.repository.AddonServiceRepository;
import com.kstn.group4.backend.venue.repository.PitchRepository;
import com.kstn.group4.backend.venue.repository.TimeSlotRepository;
import com.kstn.group4.backend.venue.repository.VenueRepository;
import com.kstn.group4.backend.venue.service.player.VenuePlayerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class VenuePlayerControllerIntegrationTest {

    @Autowired
    private VenuePlayerService venuePlayerService;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private PitchRepository pitchRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AddonServiceRepository addonServiceRepository;

    @Autowired
    private TimeSlotRepository timeSlotRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;
    private Venue savedVenue;
    private Pitch savedPitch;
    private User manager;
    private User player;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();

        manager = new User();
        manager.setUsername("venueManager");
        manager.setEmail("manager@test.com");
        manager.setPassword("password");
        manager.setRole("ADMIN");
        manager = userRepository.save(manager);

        player = new User();
        player.setUsername("testPlayer");
        player.setEmail("player@test.com");
        player.setPassword("password");
        player.setRole("PLAYER");
        player = userRepository.save(player);

        Venue venue = new Venue();
        venue.setName("Test Stadium");
        venue.setAddress("123 Test Street");
        venue.setDescription("A venue for testing");
        venue.setManagerId(manager.getId());
        venue.setOpenTime(LocalTime.of(8, 0));
        venue.setCloseTime(LocalTime.of(22, 0));
        venue.setLatitude(10.762622);
        venue.setLongitude(106.660172);
        savedVenue = venueRepository.save(venue);

        Pitch pitch = new Pitch();
        pitch.setName("Pitch 1");
        pitch.setPitchType(PitchType.SAN_5);
        pitch.setIsActive(true);
        pitch.setBasePrice(new BigDecimal("100000"));
        pitch.setVenue(savedVenue);
        savedPitch = pitchRepository.save(pitch);

        if (timeSlotRepository.findAll().isEmpty()) {
            for (int i = 1; i <= 11; i++) {
                TimeSlot ts = new TimeSlot();
                ts.setSlotNumber(i);
                ts.setStartTime(LocalTime.of(6, 30).plusMinutes((i - 1) * 90L));
                ts.setEndTime(ts.getStartTime().plusMinutes(90));
                ts.setIsActive(true);
                timeSlotRepository.save(ts);
            }
        }
    }

    private String generatePlayerToken() {
        UserPrincipal userPrincipal = UserPrincipal.build(player);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                userPrincipal, null, userPrincipal.getAuthorities()
        );
        return jwtTokenProvider.generateToken(auth);
    }

    private void createAddonService() {
        AddonService service = new AddonService();
        service.setVenue(savedVenue);
        service.setName("Nước uống");
        service.setDescription("Nước uống đóng chai");
        service.setPrice(new BigDecimal("10000"));
        service.setUnit("chai");
        service.setStatus("ACTIVE");
        addonServiceRepository.save(service);
    }

    // ===== GET VENUES =====

    @Test
    @WithMockUser(roles = {"PLAYER"})
    void getVenues_withPlayerAuth_returns200() throws Exception {
        mockMvc.perform(get("/player/venues")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").exists())
                .andExpect(jsonPath("$.content", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void getVenues_withAdminAuth_returns200() throws Exception {
        mockMvc.perform(get("/player/venues")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", is(notNullValue())));
    }

    @Test
    void getVenues_withoutAuth_returns401() throws Exception {
        mockMvc.perform(get("/player/venues")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isUnauthorized());
    }

    // ===== GET AVAILABILITY =====

    @Test
    @WithMockUser(roles = {"PLAYER"})
    void getAvailability_forExistingVenue_returns200() throws Exception {
        mockMvc.perform(get("/player/venues/{id}/availability", savedVenue.getId())
                        .param("date", LocalDate.now().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.venueId", is(savedVenue.getId())))
                .andExpect(jsonPath("$.venueName", is("Test Stadium")))
                .andExpect(jsonPath("$.date", is(LocalDate.now().toString())))
                .andExpect(jsonPath("$.pitches", is(notNullValue())))
                .andExpect(jsonPath("$.pitches", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @WithMockUser(roles = {"PLAYER"})
    void getAvailability_forNonExistentVenue_returns404() throws Exception {
        mockMvc.perform(get("/player/venues/{id}/availability", 99999)
                        .param("date", LocalDate.now().toString()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", containsString("99999")));
    }

    // ===== GET SERVICES =====

    @Test
    @WithMockUser(roles = {"PLAYER"})
    void getServices_forExistingVenue_returns200() throws Exception {
        createAddonService();

        mockMvc.perform(get("/player/venues/{id}/services", savedVenue.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", is(notNullValue())))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Nước uống")))
                .andExpect(jsonPath("$[0].price", is(10000)))
                .andExpect(jsonPath("$[0].unit", is("chai")));
    }

    @Test
    @WithMockUser(roles = {"PLAYER"})
    void getServices_forNonExistentVenue_returns404() throws Exception {
        mockMvc.perform(get("/player/venues/{id}/services", 99999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", containsString("99999")));
    }

    // ===== GET PITCH SLOTS =====

    @Test
    @WithMockUser(roles = {"PLAYER"})
    void getPitchSlots_withAllFilter_returnsCorrectFormat() throws Exception {
        mockMvc.perform(get("/player/venues/pitches/{pitchId}/slots", savedPitch.getId())
                        .param("date", LocalDate.now().toString())
                        .param("filter", "all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pitchId", is(savedPitch.getId())))
                .andExpect(jsonPath("$.pitchName", is("Pitch 1")))
                .andExpect(jsonPath("$.bookingDate", is(LocalDate.now().toString())))
                .andExpect(jsonPath("$.isWeekend", notNullValue()))
                .andExpect(jsonPath("$.slots", is(notNullValue())))
                .andExpect(jsonPath("$.slots", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @WithMockUser(roles = {"PLAYER"})
    void getPitchSlots_withAvailableFilter_returnsAvailableSlotsOnly() throws Exception {
        mockMvc.perform(get("/player/venues/pitches/{pitchId}/slots", savedPitch.getId())
                        .param("date", LocalDate.now().toString())
                        .param("filter", "available"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slots", is(notNullValue())))
                .andExpect(jsonPath("$.pitchId", is(savedPitch.getId())));
    }

    @Test
    @WithMockUser(roles = {"PLAYER"})
    void getPitchSlots_forNonExistentPitch_returns404() throws Exception {
        mockMvc.perform(get("/player/venues/pitches/{pitchId}/slots", 99999)
                        .param("date", LocalDate.now().toString())
                        .param("filter", "all"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", containsString("99999")));
    }

    @Test
    @WithMockUser(roles = {"PLAYER"})
    void getPitchSlots_withDefaultFilter_returns200() throws Exception {
        mockMvc.perform(get("/player/venues/pitches/{pitchId}/slots", savedPitch.getId())
                        .param("date", LocalDate.now().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pitchId", is(savedPitch.getId())));
    }
}
