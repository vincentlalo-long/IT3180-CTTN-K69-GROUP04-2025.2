package com.kstn.group4.backend.booking.dto.admin;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PitchScheduleDto {
    private Long pitchId;
    private String pitchName;
    private String venueName;
    private List<ScheduleSlotDto> slots;
}
