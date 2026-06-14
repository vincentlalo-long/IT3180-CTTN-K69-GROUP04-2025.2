package com.kstn.group4.backend.venue.service.admin;

import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.venue.dto.ServiceItemRequest;
import com.kstn.group4.backend.venue.dto.ServiceItemResponse;
import com.kstn.group4.backend.venue.entity.AddonService;
import com.kstn.group4.backend.venue.entity.Venue;
import com.kstn.group4.backend.venue.repository.AddonServiceRepository;
import com.kstn.group4.backend.venue.repository.VenueRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AddonServiceManagementService {

    private final AddonServiceRepository addonServiceRepository;
    private final VenueRepository venueRepository;

    @Transactional(readOnly = true)
    public List<ServiceItemResponse> getServicesForManager(Integer venueId, Integer managerId) {
        ensureManagedVenue(venueId, managerId);
        return addonServiceRepository.findByVenueIdIncludingPitch(venueId).stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Lấy danh sách dịch vụ ACTIVE của một cụm sân — không cần kiểm tra quyền sở hữu.
     * Dùng cho luồng chốt hóa đơn (settle invoice), bất kỳ admin nào đăng nhập đều có thể thấy.
     */
    @Transactional(readOnly = true)
    public List<ServiceItemResponse> getActiveServicesForVenue(Integer venueId) {
        return addonServiceRepository.findActiveByVenueIdIncludingPitch(venueId, "ACTIVE").stream()
                .map(this::toResponse)
                .toList();
    }

    public ServiceItemResponse createService(Integer venueId, Integer managerId, ServiceItemRequest request) {
        Venue venue = ensureManagedVenue(venueId, managerId);

        AddonService service = new AddonService();
        service.setVenue(venue);
        applyRequest(service, request);

        return toResponse(addonServiceRepository.save(service));
    }

    public ServiceItemResponse updateService(Integer serviceId, Integer managerId, ServiceItemRequest request) {
        AddonService service = addonServiceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay dich vu voi ID: " + serviceId, "Service"));

        Integer venueId = resolveVenueId(service);
        ensureManagedVenue(venueId, managerId);
        applyRequest(service, request);

        return toResponse(addonServiceRepository.save(service));
    }

    public void deleteService(Integer serviceId, Integer managerId) {
        AddonService service = addonServiceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay dich vu voi ID: " + serviceId, "Service"));

        Integer venueId = resolveVenueId(service);
        ensureManagedVenue(venueId, managerId);
        addonServiceRepository.delete(service);
    }

    private Venue ensureManagedVenue(Integer venueId, Integer managerId) {
        return venueRepository.findByIdAndManagerId(venueId, managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay cum san voi ID: " + venueId, "Venue"));
    }

    private void applyRequest(AddonService service, ServiceItemRequest request) {
        service.setName(request.name());
        service.setDescription(request.description());
        service.setPrice(request.price());
        service.setUnit(request.unit());
        service.setStatus(normalizeStatus(request.status()));
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return "ACTIVE";
        }
        return status.trim().toUpperCase();
    }

    private Integer resolveVenueId(AddonService service) {
        if (service.getVenue() != null) {
            return service.getVenue().getId();
        }
        if (service.getPitch() != null && service.getPitch().getVenue() != null) {
            return service.getPitch().getVenue().getId();
        }
        throw new ResourceNotFoundException("Dich vu chua duoc gan vao cum san", "Venue");
    }

    private ServiceItemResponse toResponse(AddonService service) {
        return new ServiceItemResponse(
                service.getId(),
                resolveVenueId(service),
                service.getName(),
                service.getDescription(),
                service.getPrice(),
                service.getUnit(),
                service.getStatus()
        );
    }
}
