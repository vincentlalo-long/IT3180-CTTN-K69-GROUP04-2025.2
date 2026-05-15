package com.kstn.group4.backend.venue.service.player;

import com.kstn.group4.backend.booking.entity.Booking;
import com.kstn.group4.backend.booking.repository.BookingRepository;
import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.venue.dto.player.PitchAvailability;
import com.kstn.group4.backend.venue.dto.player.PitchSlotsResponse;
import com.kstn.group4.backend.venue.dto.player.SlotDetailResponse;
import com.kstn.group4.backend.venue.dto.player.SlotStatus;
import com.kstn.group4.backend.venue.dto.player.VenueAvailabilityResponse;
import com.kstn.group4.backend.venue.dto.player.VenueResponseDTO;
import com.kstn.group4.backend.venue.entity.Pitch;
import com.kstn.group4.backend.venue.entity.PriceRule;
import com.kstn.group4.backend.venue.entity.TimeSlot;
import com.kstn.group4.backend.venue.entity.Venue;
import com.kstn.group4.backend.venue.repository.PitchRepository;
import com.kstn.group4.backend.venue.repository.TimeSlotRepository;
import com.kstn.group4.backend.venue.repository.VenueRepository;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
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

    private final VenueRepository venueRepository;
    private final PitchRepository pitchRepository;
    private final BookingRepository bookingRepository;
    private final TimeSlotRepository timeSlotRepository;

    public Page<VenueResponseDTO> getActiveVenues(Pageable pageable) {
        return venueRepository.findActiveVenuesForPlayer(pageable)
                .map(this::toVenueResponseDTO);
    }

    public VenueAvailabilityResponse getAvailability(Integer venueId, LocalDate date) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cụm sân với ID: " + venueId, "Venue"));

        List<Pitch> pitches = pitchRepository.findActiveByVenueIdWithPriceRules(venueId);
        List<Booking> bookings = bookingRepository.findConfirmedByVenueIdAndBookingDate(venueId, date);

        Map<Integer, Map<Integer, Booking>> bookingLookup = buildTimeSlotBookingMap(bookings);
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

    /**
     * Get detailed slot availability and pricing for a single pitch on a specific date.
     * 
     * @param pitchId the pitch ID
     * @param date the target booking date
     * @param filter filter slots: "all" (default), "available", "occupied"
     * @return PitchSlotsResponse containing all 11 slots with availability and pricing
     */
    public PitchSlotsResponse getPitchSlots(Integer pitchId, LocalDate date, String filter) {
        Pitch pitch = pitchRepository.findById(pitchId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sân với ID: " + pitchId, "Pitch"));

        List<TimeSlot> timeSlots = timeSlotRepository.findByPitchIdOrderBySlotNumberAsc(pitchId);
        List<Booking> bookings = bookingRepository.findConfirmedByPitchIdAndBookingDate(pitchId, date);
        List<PriceRule> priceRules = pitch.getPriceRules() == null ? List.of() : pitch.getPriceRules();

        // Create map: timeSlotId → Booking (for O(1) lookup)
        Map<Integer, Booking> slotBookingMap = new HashMap<>();
        for (Booking booking : bookings) {
            if (booking.getTimeSlot() != null && booking.getTimeSlot().getId() != null) {
                slotBookingMap.put(booking.getTimeSlot().getId(), booking);
            }
        }

        boolean isWeekend = isWeekend(date);
        String filterLower = filter == null ? "all" : filter.toLowerCase();

        // Convert TimeSlots to SlotDetailResponse with availability and pricing
        List<SlotDetailResponse> slots = timeSlots.stream()
                .filter(timeSlot -> timeSlot.getIsActive() == null || timeSlot.getIsActive())
                .map(timeSlot -> {
                    Booking booking = slotBookingMap.get(timeSlot.getId());
                    boolean isAvailable = booking == null;

                    // Apply filter
                    if ("available".equals(filterLower) && !isAvailable) {
                        return null;
                    }
                    if ("occupied".equals(filterLower) && isAvailable) {
                        return null;
                    }

                    BigDecimal price = findPrice(priceRules, timeSlot.getSlotNumber(), isWeekend);

                    return new SlotDetailResponse(
                            timeSlot.getId(),
                            timeSlot.getSlotNumber(),
                            timeSlot.getStartTime(),
                            timeSlot.getEndTime(),
                            price,
                            isAvailable
                    );
                })
                .filter(slot -> slot != null)
                .toList();

        return new PitchSlotsResponse(
                pitch.getId(),
                pitch.getName(),
                date,
                isWeekend,
                slots
        );
    }

    /**
     * Build slot statuses for venue-level availability view.
     * Maps TimeSlot entities to SlotStatus DTOs for legacy API compatibility.
     * 
     * @param pitch the pitch entity with timeSlots collection
     * @param slotBookingMap map of timeSlotId → Booking for O(1) lookup
     * @param weekend flag indicating if the date is a weekend
     * @return list of SlotStatus objects (legacy DTO)
     */
    private List<SlotStatus> buildSlotStatuses(Pitch pitch, Map<Integer, Booking> slotBookingMap, boolean weekend) {
        List<PriceRule> priceRules = pitch.getPriceRules() == null ? List.of() : pitch.getPriceRules();
        List<TimeSlot> timeSlots = pitch.getTimeSlots() == null ? List.of() : pitch.getTimeSlots();

        return timeSlots.stream()
                .filter(timeSlot -> timeSlot.getIsActive() == null || timeSlot.getIsActive())
                .map(timeSlot -> {
                    Booking booking = slotBookingMap.get(timeSlot.getId());
                    String status = booking != null ? "BOOKED" : "AVAILABLE";
                    BigDecimal price = findPrice(priceRules, timeSlot.getSlotNumber(), weekend);

                    return new SlotStatus(
                            timeSlot.getSlotNumber(),
                            timeSlot.getStartTime(),
                            timeSlot.getEndTime(),
                            price,
                            status
                    );
                })
                .toList();
    }

    /**
     * Build a lookup map for quick booking availability checks by TimeSlot ID.
     * 
     * Maps: pitchId → (timeSlotId → Booking)
     * This ensures we use TimeSlot IDs as keys instead of LocalTime,
     * eliminating potential precision issues with time-based lookups.
     * 
     * @param bookings list of confirmed bookings for a venue and date
     * @return nested map for O(1) booking lookup
     */
    private Map<Integer, Map<Integer, Booking>> buildTimeSlotBookingMap(List<Booking> bookings) {
        Map<Integer, Map<Integer, Booking>> lookup = new HashMap<>();
        for (Booking booking : bookings) {
            if (booking.getPitch() == null || booking.getPitch().getId() == null || booking.getTimeSlot() == null || booking.getTimeSlot().getId() == null) {
                continue;
            }

            lookup.computeIfAbsent(booking.getPitch().getId(), key -> new HashMap<>())
                    .put(booking.getTimeSlot().getId(), booking);
        }
        return lookup;
    }

    private BigDecimal findPrice(List<PriceRule> priceRules, Integer slotNumber, boolean weekend) {
        return priceRules.stream()
                .filter(rule -> slotNumber.equals(rule.getSlotNumber()) && weekend == Boolean.TRUE.equals(rule.getIsWeekend()))
                .map(PriceRule::getPrice)
                .findFirst()
                .orElse(null);
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