package com.kstn.group4.backend.service;

import com.kstn.group4.backend.dto.pitch.AddonServiceResponse;
import com.kstn.group4.backend.dto.pitch.AvailabilityResponse;
import com.kstn.group4.backend.dto.pitch.PitchDetailResponse;
import com.kstn.group4.backend.dto.pitch.PitchSummaryResponse;
import com.kstn.group4.backend.dto.pitch.PriceRuleResponse;
import com.kstn.group4.backend.entity.Booking;
import com.kstn.group4.backend.entity.Pitch;
import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.repository.BookingRepository;
import com.kstn.group4.backend.repository.PitchRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicPitchService {

    private static final Set<String> ACTIVE_BOOKING_STATUSES = Set.of("pending", "approved");

    private final PitchRepository pitchRepository;
    private final BookingRepository bookingRepository;

        @Transactional(readOnly = true)
    public List<PitchSummaryResponse> searchPitches(String pitchType, String surfaceType, String address) {
        return pitchRepository.search(normalize(pitchType), normalize(surfaceType), normalize(address))
                .stream()
                .map(this::toPitchSummary)
                .toList();
    }

        @Transactional(readOnly = true)
    public PitchDetailResponse getPitchDetail(Integer pitchId) {
        Pitch pitch = pitchRepository.findById(pitchId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sân với id: " + pitchId));

        return PitchDetailResponse.builder()
                .id(pitch.getId())
                .name(pitch.getName())
                .address(pitch.getAddress())
                .pitchType(pitch.getPitchType())
                .surfaceType(pitch.getSurfaceType())
                .basePrice(pitch.getBasePrice())
                .imageUrl(pitch.getImageUrl())
                .priceRules(pitch.getPriceRules().stream()
                        .map(priceRule -> PriceRuleResponse.builder()
                                .id(priceRule.getId())
                                .dayOfWeek(priceRule.getDayOfWeek())
                                .startTime(priceRule.getStartTime())
                                .endTime(priceRule.getEndTime())
                                .price(priceRule.getPrice())
                                .build())
                        .toList())
                .services(pitch.getServices().stream()
                        .map(service -> AddonServiceResponse.builder()
                                .id(service.getId())
                                .name(service.getName())
                                .price(service.getPrice())
                                .unit(service.getUnit())
                                .build())
                        .toList())
                .build();
    }

        @Transactional(readOnly = true)
    public AvailabilityResponse getAvailability(Integer pitchId, LocalDate date) {
        Pitch pitch = pitchRepository.findById(pitchId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sân với id: " + pitchId));

        List<Booking> booked = bookingRepository.findByPitchIdAndBookingDateAndStatusIn(
                pitch.getId(),
                date,
                ACTIVE_BOOKING_STATUSES
        );

        List<AvailabilityResponse.TimeSlotResponse> bookedSlots = booked.stream()
                .map(booking -> AvailabilityResponse.TimeSlotResponse.builder()
                        .startTime(booking.getStartTime())
                        .endTime(booking.getEndTime())
                        .build())
                .toList();

        List<AvailabilityResponse.TimeSlotResponse> availableSlots = buildAvailableSlots(bookedSlots);

        return AvailabilityResponse.builder()
                .pitchId(pitchId)
                .date(date)
                .bookedSlots(bookedSlots)
                .availableSlots(availableSlots)
                .build();
    }

    private List<AvailabilityResponse.TimeSlotResponse> buildAvailableSlots(
            List<AvailabilityResponse.TimeSlotResponse> bookedSlots
    ) {
        LocalTime startOfDay = LocalTime.of(5, 0);
        LocalTime endOfDay = LocalTime.of(23, 0);
        List<AvailabilityResponse.TimeSlotResponse> slots = new ArrayList<>();

        for (LocalTime cursor = startOfDay; cursor.isBefore(endOfDay); cursor = cursor.plusHours(1)) {
            
            // 1. TẠO BẢN SAO EFFECTIVELY FINAL Ở ĐÂY ĐỂ LAMBDA ĐỌC ĐƯỢC
            final LocalTime currentStart = cursor; 
            LocalTime currentEnd = currentStart.plusHours(1);

            // 2. Dùng bản sao currentStart thay vì cursor
            boolean overlap = bookedSlots.stream().anyMatch(slot ->
                    slot.startTime().isBefore(currentEnd) && slot.endTime().isAfter(currentStart)
            );
            
            if (!overlap) {
                slots.add(AvailabilityResponse.TimeSlotResponse.builder()
                        .startTime(currentStart)
                        .endTime(currentEnd)
                        .build());
            }
        }
        return slots;
    }

    private PitchSummaryResponse toPitchSummary(Pitch pitch) {
        return PitchSummaryResponse.builder()
                .id(pitch.getId())
                .name(pitch.getName())
                .address(pitch.getAddress())
                .pitchType(pitch.getPitchType())
                .surfaceType(pitch.getSurfaceType())
                .basePrice(pitch.getBasePrice())
                .imageUrl(pitch.getImageUrl())
                .build();
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
