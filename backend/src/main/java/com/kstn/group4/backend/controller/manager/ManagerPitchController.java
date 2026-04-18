package com.kstn.group4.backend.controller.manager;

import com.kstn.group4.backend.dto.pitch.AddonServiceResponse;
import com.kstn.group4.backend.dto.pitch.ManagerAddPriceRuleRequest;
import com.kstn.group4.backend.dto.pitch.ManagerAddServiceRequest;
import com.kstn.group4.backend.dto.pitch.ManagerCreatePitchRequest;
import com.kstn.group4.backend.dto.pitch.ManagerUpdatePitchRequest;
import com.kstn.group4.backend.dto.pitch.PitchSummaryResponse;
import com.kstn.group4.backend.dto.pitch.PriceRuleResponse;
import com.kstn.group4.backend.service.AuthenticatedUserService;
import com.kstn.group4.backend.service.ManagerPitchService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/managers/pitches")
public class ManagerPitchController {

    private final ManagerPitchService managerPitchService;
    private final AuthenticatedUserService authenticatedUserService;

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<PitchSummaryResponse> createPitch(@Valid @RequestBody ManagerCreatePitchRequest request) {
        Integer managerId = authenticatedUserService.getCurrentUserId();
        PitchSummaryResponse response = managerPitchService.createPitch(managerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<List<PitchSummaryResponse>> getOwnedPitches() {
        Integer managerId = authenticatedUserService.getCurrentUserId();
        return ResponseEntity.ok(managerPitchService.getOwnedPitches(managerId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<PitchSummaryResponse> updatePitch(
            @PathVariable("id") Integer pitchId,
            @Valid @RequestBody ManagerUpdatePitchRequest request
    ) {
        Integer managerId = authenticatedUserService.getCurrentUserId();
        return ResponseEntity.ok(managerPitchService.updatePitch(managerId, pitchId, request));
    }

    @PostMapping("/{id}/services")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<AddonServiceResponse> addService(
            @PathVariable("id") Integer pitchId,
            @Valid @RequestBody ManagerAddServiceRequest request
    ) {
        Integer managerId = authenticatedUserService.getCurrentUserId();
        AddonServiceResponse response = managerPitchService.addService(managerId, pitchId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{id}/price-rules")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<PriceRuleResponse> addPriceRule(
            @PathVariable("id") Integer pitchId,
            @Valid @RequestBody ManagerAddPriceRuleRequest request
    ) {
        Integer managerId = authenticatedUserService.getCurrentUserId();
        PriceRuleResponse response = managerPitchService.addPriceRule(managerId, pitchId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
