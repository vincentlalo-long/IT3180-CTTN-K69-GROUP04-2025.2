package com.kstn.group4.backend.venue;

import com.kstn.group4.backend.user.entity.User;
import com.kstn.group4.backend.user.repository.UserRepository;
import com.kstn.group4.backend.venue.entity.Pitch;
import com.kstn.group4.backend.venue.entity.PitchType;
import com.kstn.group4.backend.venue.entity.Venue;
import com.kstn.group4.backend.venue.repository.PitchRepository;
import com.kstn.group4.backend.venue.repository.VenueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class VenueIntegrationTest {

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private PitchRepository pitchRepository;

    @Autowired
    private UserRepository userRepository;

    private Venue savedVenue;
    private User manager;

    @BeforeEach
    void setUp() {
        manager = new User();
        manager.setUsername("venueManager");
        manager.setEmail("venueManager@test.com");
        manager.setPassword("password");
        manager.setRole("ADMIN");
        manager = userRepository.save(manager);

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
    }

    @Test
    void createAndRetrieveVenue() {
        Venue found = venueRepository.findById(savedVenue.getId()).orElseThrow();

        assertThat(found.getId()).isNotNull();
        assertThat(found.getName()).isEqualTo("Test Stadium");
        assertThat(found.getAddress()).isEqualTo("123 Test Street");
        assertThat(found.getDescription()).isEqualTo("A venue for testing");
        assertThat(found.getManagerId()).isEqualTo(manager.getId());
        assertThat(found.getOpenTime()).isEqualTo(LocalTime.of(8, 0));
        assertThat(found.getCloseTime()).isEqualTo(LocalTime.of(22, 0));
        assertThat(found.getLatitude()).isEqualTo(10.762622);
        assertThat(found.getLongitude()).isEqualTo(106.660172);
    }

    @Test
    void updateVenueFields() {
        savedVenue.setName("Updated Stadium");
        savedVenue.setAddress("456 Updated Avenue");
        savedVenue.setDescription("Updated description");
        venueRepository.save(savedVenue);

        Venue found = venueRepository.findById(savedVenue.getId()).orElseThrow();
        assertThat(found.getName()).isEqualTo("Updated Stadium");
        assertThat(found.getAddress()).isEqualTo("456 Updated Avenue");
        assertThat(found.getDescription()).isEqualTo("Updated description");
    }

    @Test
    void deleteVenue() {
        Integer venueId = savedVenue.getId();
        venueRepository.deleteById(venueId);

        assertThat(venueRepository.findById(venueId)).isEmpty();
    }

    @Test
    void findVenuesByManagerId() {
        User otherManager = new User();
        otherManager.setUsername("otherManager");
        otherManager.setEmail("otherManager@test.com");
        otherManager.setPassword("password");
        otherManager.setRole("ADMIN");
        otherManager = userRepository.save(otherManager);

        Venue venue2 = new Venue();
        venue2.setName("Another Stadium");
        venue2.setManagerId(otherManager.getId());
        venue2.setOpenTime(LocalTime.of(7, 0));
        venue2.setCloseTime(LocalTime.of(23, 0));
        venueRepository.save(venue2);

        Page<Venue> result = venueRepository.findByManagerId(
                manager.getId(), PageRequest.of(0, 10));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Test Stadium");
        assertThat(result.getContent().get(0).getManagerId()).isEqualTo(manager.getId());
    }

    @Test
    void countPitchesByVenueId() {
        Pitch pitch1 = new Pitch();
        pitch1.setName("Pitch 1");
        pitch1.setPitchType(PitchType.SAN_5);
        pitch1.setIsActive(true);
        pitch1.setBasePrice(new BigDecimal("100000"));
        pitch1.setVenue(savedVenue);
        pitchRepository.save(pitch1);

        Pitch pitch2 = new Pitch();
        pitch2.setName("Pitch 2");
        pitch2.setPitchType(PitchType.SAN_7);
        pitch2.setIsActive(true);
        pitch2.setBasePrice(new BigDecimal("150000"));
        pitch2.setVenue(savedVenue);
        pitchRepository.save(pitch2);

        long count = pitchRepository.countByVenueId(savedVenue.getId());
        assertThat(count).isEqualTo(2);
    }

    @Test
    void pitchesBelongToVenue() {
        Pitch pitch = new Pitch();
        pitch.setName("Main Pitch");
        pitch.setPitchType(PitchType.SAN_11);
        pitch.setIsActive(true);
        pitch.setBasePrice(new BigDecimal("200000"));
        pitch.setVenue(savedVenue);
        pitchRepository.save(pitch);

        List<Pitch> pitches = pitchRepository.findByVenueId(savedVenue.getId());
        assertThat(pitches).hasSize(1);
        assertThat(pitches.get(0).getVenue().getId()).isEqualTo(savedVenue.getId());
    }
}
