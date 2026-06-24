package com.kstn.group4.backend.venue.controller;

import com.kstn.group4.backend.config.security.services.UserPrincipal;
import com.kstn.group4.backend.venue.dto.ServiceItemRequest;
import com.kstn.group4.backend.venue.dto.ServiceItemResponse;
import com.kstn.group4.backend.venue.service.admin.AddonServiceManagementService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminAddonServiceController {

    private final AddonServiceManagementService addonServiceManagementService;

    @GetMapping("/venues/{venueId}/services")
    public ResponseEntity<List<ServiceItemResponse>> getServices(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Integer venueId
    ) {
        return ResponseEntity.ok(addonServiceManagementService.getServicesForManager(venueId, principal.getId()));
    }

    @PostMapping("/venues/{venueId}/services")
    public ResponseEntity<ServiceItemResponse> createService(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Integer venueId,
            @Valid @RequestBody ServiceItemRequest request
    ) {
        ServiceItemResponse response = addonServiceManagementService.createService(venueId, principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/services/{serviceId}")
    public ResponseEntity<ServiceItemResponse> updateService(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Integer serviceId,
            @Valid @RequestBody ServiceItemRequest request
    ) {
        return ResponseEntity.ok(addonServiceManagementService.updateService(serviceId, principal.getId(), request));
    }

    @DeleteMapping("/services/{serviceId}")
    public ResponseEntity<Void> deleteService(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Integer serviceId
    ) {
        addonServiceManagementService.deleteService(serviceId, principal.getId());
        return ResponseEntity.noContent().build();
    }
}
