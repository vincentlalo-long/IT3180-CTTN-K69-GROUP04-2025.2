package com.kstn.group4.backend.venue.service.admin;

import com.kstn.group4.backend.booking.repository.BookingRepository;
import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.venue.dto.admin.AdminVenueResponseDTO;
import com.kstn.group4.backend.venue.dto.admin.VenueDetailResponse;
import com.kstn.group4.backend.venue.dto.admin.VenueUpsertRequest;
import com.kstn.group4.backend.venue.entity.Pitch;
import com.kstn.group4.backend.venue.entity.Venue;
import com.kstn.group4.backend.venue.repository.PitchRepository;
import com.kstn.group4.backend.venue.repository.VenueRepository;
import com.kstn.group4.backend.activitylog.service.ActivityLogService;
import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class VenueService {

    private final VenueRepository venueRepository;
    private final PitchRepository pitchRepository;
    private final BookingRepository bookingRepository;
    private final ActivityLogService activityLogService;

    private void logVenueActivity(String actionType, String targetId, String description) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        Integer adminId = null;
        String adminName = "System";
        if (auth != null && auth.getPrincipal() instanceof com.kstn.group4.backend.config.security.services.UserPrincipal principal) {
            adminId = principal.getId();
            adminName = principal.getAppUsername();
        }
        activityLogService.log(adminId, adminName, actionType, "VENUE", targetId, description, null, null);
    }

    public VenueDetailResponse createVenue(Venue request) {
        if (request.getOpenTime() == null) {
            request.setOpenTime(LocalTime.of(6, 30));
        }
        if (request.getCloseTime() == null) {
            request.setCloseTime(LocalTime.of(23, 0));
        }
        Venue savedVenue = venueRepository.save(request);
        logVenueActivity("CREATE_VENUE", savedVenue.getId().toString(), "Tạo cụm sân: " + savedVenue.getName());
        return toVenueDetailResponse(savedVenue);
    }

    @Transactional(readOnly = true)
    public VenueDetailResponse getVenueById(Integer venueId) {
        Venue venue = venueRepository.findByIdWithPitches(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cụm sân với ID: " + venueId, "Venue"));
        return toVenueDetailResponse(venue);
    }

    @Transactional(readOnly = true)
    public List<VenueDetailResponse> getAllVenues() {
        return venueRepository.findAllWithPitches()
                .stream()
                .map(this::toVenueDetailResponse)
                .toList();
    }

    public VenueDetailResponse updateVenue(Integer venueId, Venue request) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cụm sân với ID: " + venueId, "Venue"));

        venue.setName(request.getName());
        venue.setAddress(request.getAddress());
        venue.setDescription(request.getDescription());
        venue.setManagerId(request.getManagerId());
        venue.setOpenTime(request.getOpenTime() != null ? request.getOpenTime() : venue.getOpenTime());
        venue.setCloseTime(request.getCloseTime() != null ? request.getCloseTime() : venue.getCloseTime());

        Venue updatedVenue = venueRepository.save(venue);
        logVenueActivity("UPDATE_VENUE", updatedVenue.getId().toString(), "Cập nhật cụm sân: " + updatedVenue.getName());
        return toVenueDetailResponse(updatedVenue);
    }

    public void deleteVenue(Integer venueId) {
        if (!venueRepository.existsById(venueId)) {
            throw new ResourceNotFoundException("Không tìm thấy cụm sân với ID: " + venueId, "Venue");
        }
        venueRepository.deleteById(venueId);
        logVenueActivity("DELETE_VENUE", venueId.toString(), "Xóa cụm sân");
    }

    @Transactional(readOnly = true)
    public Page<AdminVenueResponseDTO> getVenuesByManager(Integer managerId, Pageable pageable) {
        Page<Venue> venuesPage = venueRepository.findAll(pageable);
        List<Integer> venueIds = venuesPage.getContent().stream()
                .map(Venue::getId)
                .toList();
        Map<Integer, Long> pitchCounts = new HashMap<>();
        if (!venueIds.isEmpty()) {
            List<Object[]> results = pitchRepository.countPitchesGroupByVenueIds(venueIds);
            for (Object[] row : results) {
                pitchCounts.put((Integer) row[0], (Long) row[1]);
            }
        }
        return venuesPage.map(venue -> toAdminVenueResponseWithoutManager(venue, pitchCounts));
    }

    @Transactional(readOnly = true)
    public AdminVenueResponseDTO getVenueByManager(Integer venueId, Integer managerId) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cụm sân với ID: " + venueId, "Venue"));
        Map<Integer, Long> pitchCounts = Map.of(venue.getId(), pitchRepository.countByVenueId(venue.getId()));
        return toAdminVenueResponseWithoutManager(venue, pitchCounts);
    }

    public AdminVenueResponseDTO createVenueByManager(VenueUpsertRequest request, String imageUrl, Integer managerId) {
        Venue venue = new Venue();
        venue.setName(request.name());
        venue.setAddress(request.address());
        venue.setDescription(request.description());
        venue.setImageUrl(imageUrl);
        venue.setManagerId(managerId);
        venue.setOpenTime(LocalTime.of(6, 30));
        venue.setCloseTime(LocalTime.of(23, 0));

        Venue saved = venueRepository.save(venue);
        logVenueActivity("CREATE_VENUE", saved.getId().toString(), "Tạo cụm sân: " + saved.getName());
        return toAdminVenueResponse(saved, managerId);
    }

    public AdminVenueResponseDTO updateVenueByManager(Integer venueId, VenueUpsertRequest request, String imageUrl, Integer managerId) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cụm sân với ID: " + venueId, "Venue"));

        venue.setName(request.name());
        venue.setAddress(request.address());
        venue.setDescription(request.description());

        // Chỉ cập nhật imageUrl khi có giá trị mới (admin gửi file mới)
        if (imageUrl != null && !imageUrl.isBlank()) {
            venue.setImageUrl(imageUrl);
        }

        venue.setManagerId(managerId);

        Venue updated = venueRepository.save(venue);
        logVenueActivity("UPDATE_VENUE", updated.getId().toString(), "Cập nhật cụm sân: " + updated.getName());
        return toAdminVenueResponse(updated, managerId);
    }

    public void deleteVenueByManager(Integer venueId, Integer managerId) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cụm sân với ID: " + venueId, "Venue"));
        venueRepository.delete(venue);
        logVenueActivity("DELETE_VENUE", venueId.toString(), "Xóa cụm sân");
    }

    @Transactional(readOnly = true)
    public Page<AdminVenueResponseDTO> getAllVenuesForAdmin(Pageable pageable) {
        Page<Venue> venuesPage = venueRepository.findAll(pageable);
        List<Integer> venueIds = venuesPage.getContent().stream()
                .map(Venue::getId)
                .toList();
        Map<Integer, Long> pitchCounts = new HashMap<>();
        if (!venueIds.isEmpty()) {
            List<Object[]> results = pitchRepository.countPitchesGroupByVenueIds(venueIds);
            for (Object[] row : results) {
                pitchCounts.put((Integer) row[0], (Long) row[1]);
            }
        }
        return venuesPage.map(venue -> toAdminVenueResponseWithoutManager(venue, pitchCounts));
    }

    @Transactional(readOnly = true)
    public AdminVenueResponseDTO getVenueByIdForAdmin(Integer venueId) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cụm sân với ID: " + venueId, "Venue"));
        Map<Integer, Long> pitchCounts = Map.of(venue.getId(), pitchRepository.countByVenueId(venue.getId()));
        return toAdminVenueResponseWithoutManager(venue, pitchCounts);
    }

    private VenueDetailResponse toVenueDetailResponse(Venue venue) {
        List<VenueDetailResponse.PitchSummaryResponse> pitches = venue.getPitches() == null
                ? List.of()
                : venue.getPitches().stream()
                .map(this::toPitchSummaryResponse)
                .toList();

        return new VenueDetailResponse(
                venue.getId(),
                venue.getName(),
                venue.getAddress(),
                venue.getDescription(),
                venue.getManagerId(),
                venue.getOpenTime(),
                venue.getCloseTime(),
                venue.getLatitude(),
                venue.getLongitude(),
                pitches
        );
    }

    private AdminVenueResponseDTO toAdminVenueResponse(Venue venue, Integer managerId) {
        long totalPitches = pitchRepository.countByVenueId(venue.getId());
        BigDecimal revenue = bookingRepository.sumRevenueByVenueIdAndManagerId(venue.getId(), managerId);

        return new AdminVenueResponseDTO(
                venue.getId(),
                venue.getName(),
                venue.getAddress(),
                venue.getImageUrl(),
                revenue,
                totalPitches
        );
    }

    private AdminVenueResponseDTO toAdminVenueResponseWithoutManager(Venue venue, Map<Integer, Long> pitchCounts) {
        long totalPitches = pitchCounts.getOrDefault(venue.getId(), 0L);
        BigDecimal revenue = BigDecimal.ZERO;

        return new AdminVenueResponseDTO(
                venue.getId(),
                venue.getName(),
                venue.getAddress(),
                venue.getImageUrl(),
                revenue,
                totalPitches
        );
    }

    private VenueDetailResponse.PitchSummaryResponse toPitchSummaryResponse(Pitch pitch) {
        return new VenueDetailResponse.PitchSummaryResponse(
                pitch.getId(),
                pitch.getName(),
                pitch.getPitchType(),
                pitch.getIsActive()
        );
    }
}
