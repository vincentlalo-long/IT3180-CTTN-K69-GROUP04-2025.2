package com.kstn.group4.backend.controller.publicapi;

import com.kstn.group4.backend.dto.pitch.AvailabilityResponse;
import com.kstn.group4.backend.dto.pitch.PitchDetailResponse;
import com.kstn.group4.backend.dto.pitch.PitchSummaryResponse;
import com.kstn.group4.backend.service.PublicPitchService;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping({"/public/pitches", "/pitches"})
public class PublicPitchController {

    private final PublicPitchService publicPitchService;

    @GetMapping
    public ResponseEntity<List<PitchSummaryResponse>> getPitches(
            @RequestParam(value = "pitch_type", required = false) String pitchType,
            @RequestParam(value = "surface_type", required = false) String surfaceType,
            @RequestParam(value = "address", required = false) String address
    ) {
        return ResponseEntity.ok(publicPitchService.searchPitches(pitchType, surfaceType, address));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PitchDetailResponse> getPitchDetail(@PathVariable("id") Integer pitchId) {
        return ResponseEntity.ok(publicPitchService.getPitchDetail(pitchId));
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<AvailabilityResponse> getAvailability(
            @PathVariable("id") Integer pitchId,
            @RequestParam("date") @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(publicPitchService.getAvailability(pitchId, date));
    }
}
