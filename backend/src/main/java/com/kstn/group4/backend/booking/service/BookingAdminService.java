package com.kstn.group4.backend.booking.service;

import com.kstn.group4.backend.booking.dto.admin.PitchScheduleDto;
import com.kstn.group4.backend.booking.dto.admin.ScheduleSlotDto;
import com.kstn.group4.backend.venue.repository.PitchRepository;
import com.kstn.group4.backend.venue.repository.PitchScheduleProjection;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookingAdminService {

    private final PitchRepository pitchRepository;

    public List<PitchScheduleDto> getPitchSchedules(Long venueId, LocalDate date) {
        Integer vId = (venueId != null) ? venueId.intValue() : null;
        List<PitchScheduleProjection> projections = pitchRepository.findPitchSchedulesNatively(vId, date);

        Map<Long, PitchScheduleDto> pitchMap = new LinkedHashMap<>();

        for (PitchScheduleProjection proj : projections) {
            Long pitchId = proj.getPitchId();
            
            PitchScheduleDto dto = pitchMap.computeIfAbsent(pitchId, id -> 
                PitchScheduleDto.builder()
                    .pitchId(id)
                    .pitchName(proj.getPitchName())
                    .venueName(proj.getVenueName())
                    .slots(new ArrayList<>())
                    .build()
            );
            
            String status = "AVAILABLE";
            if (proj.getIsActive() != null && !proj.getIsActive()) {
                status = "MAINTENANCE";
            } else if (proj.getBookingStatus() != null) {
                status = "BOOKED";
            }

            ScheduleSlotDto slotDto = ScheduleSlotDto.builder()
                .timeSlotId(proj.getTimeSlotId())
                .startTime(proj.getStartTime())
                .endTime(proj.getEndTime())
                .status(status)
                .customerName(proj.getCustomerName())
                .customerPhone(proj.getCustomerPhone())
                .depositAmount(proj.getDepositAmount())
                .build();
                
            dto.getSlots().add(slotDto);
        }

        return new ArrayList<>(pitchMap.values());
    }
}
