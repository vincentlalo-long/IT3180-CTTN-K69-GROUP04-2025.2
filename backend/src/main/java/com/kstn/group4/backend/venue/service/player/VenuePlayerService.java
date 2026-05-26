package com.kstn.group4.backend.venue.service.player;

import com.kstn.group4.backend.booking.entity.Booking;
import com.kstn.group4.backend.booking.repository.BookingRepository;
import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.venue.dto.player.PitchAvailability;
import com.kstn.group4.backend.venue.dto.player.SlotStatus;
import com.kstn.group4.backend.venue.dto.player.VenueAvailabilityResponse;
import com.kstn.group4.backend.venue.dto.player.VenueResponseDTO;
import com.kstn.group4.backend.venue.entity.Pitch;
import com.kstn.group4.backend.venue.entity.PriceRule;
import com.kstn.group4.backend.venue.entity.Venue;
import com.kstn.group4.backend.venue.repository.PitchRepository;
import com.kstn.group4.backend.venue.repository.VenueRepository;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VenuePlayerService {

    private static final int MIN_SLOT_NUMBER = 1;
    private static final int MAX_SLOT_NUMBER = 11;
    private static final LocalTime FIRST_SLOT_START = LocalTime.of(6, 30);
    private static final int SLOT_DURATION_MINUTES = 90;

    private final VenueRepository venueRepository;
    private final PitchRepository pitchRepository;
    private final BookingRepository bookingRepository;

    public Page<VenueResponseDTO> getActiveVenues(Pageable pageable) {
        return venueRepository.findActiveVenuesForPlayer(pageable)
                .map(this::toVenueResponseDTO);
    }

    public VenueAvailabilityResponse getAvailability(Integer venueId, LocalDate date) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cụm sân với ID: " + venueId, "Venue"));

        List<Pitch> pitches = pitchRepository.findActiveByVenueIdWithPriceRules(venueId);
        List<Booking> bookings = bookingRepository.findConfirmedByVenueIdAndBookingDate(venueId, date);

        Map<Integer, Map<LocalTime, Booking>> bookingLookup = buildBookingLookup(bookings);
        boolean weekend = isWeekend(date);

        List<PitchAvailability> pitchAvailabilities = pitches.stream()
                .map(pitch -> new PitchAvailability(
                        pitch.getId(),
                        pitch.getName(),
                        pitch.getPitchType(),
                        buildSlotStatuses(pitch, bookingLookup.getOrDefault(pitch.getId(), Map.of()), weekend)
                ))
                .toList();

        return new VenueAvailabilityResponse(
                venue.getId(),
                venue.getName(),
                date,
                pitchAvailabilities
        );
    }

    private List<SlotStatus> buildSlotStatuses(Pitch pitch, Map<LocalTime, Booking> pitchBookings, boolean weekend) {
        List<PriceRule> priceRules = pitch.getPriceRules() == null ? List.of() : pitch.getPriceRules();

        return java.util.stream.IntStream.rangeClosed(MIN_SLOT_NUMBER, MAX_SLOT_NUMBER)
                .mapToObj(slotNumber -> {
                    LocalTime startTime = calculateStartTime(slotNumber);
                    LocalTime endTime = startTime.plusMinutes(SLOT_DURATION_MINUTES);
                    BigDecimal price = findPrice(priceRules, slotNumber, weekend, pitch.getBasePrice());
                    String status = pitchBookings.containsKey(startTime) ? "BOOKED" : "AVAILABLE";

                    return new SlotStatus(slotNumber, startTime, endTime, price, status);
                })
                .toList();
    }

    private Map<Integer, Map<LocalTime, Booking>> buildBookingLookup(List<Booking> bookings) {
        Map<Integer, Map<LocalTime, Booking>> lookup = new HashMap<>();
        for (Booking booking : bookings) {
            if (booking.getPitch() == null || booking.getPitch().getId() == null || booking.getStartTime() == null) {
                continue;
            }

            lookup.computeIfAbsent(booking.getPitch().getId(), key -> new HashMap<>())
                    .put(booking.getStartTime(), booking);
        }
        return lookup;
    }

    private BigDecimal findPrice(
            List<PriceRule> priceRules,
            Integer slotNumber,
            boolean weekend,
            BigDecimal basePrice
    ) {
        return priceRules.stream()
                .filter(rule -> slotNumber.equals(rule.getSlotNumber()) && weekend == Boolean.TRUE.equals(rule.getIsWeekend()))
                .map(PriceRule::getPrice)
                .findFirst()
                .orElse(basePrice);
    }

    private LocalTime calculateStartTime(int slotNumber) {
        return FIRST_SLOT_START.plusMinutes((long) (slotNumber - 1) * SLOT_DURATION_MINUTES);
    }

    private boolean isWeekend(LocalDate date) {
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        return dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY;
    }

    private VenueResponseDTO toVenueResponseDTO(Venue venue) {
        return new VenueResponseDTO(
                venue.getId(),
                venue.getName(),
                venue.getAddress(),
                venue.getImageUrl()
        );
    }
}