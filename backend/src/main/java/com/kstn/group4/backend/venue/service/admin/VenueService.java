package com.kstn.group4.backend.venue.service.admin;

import com.kstn.group4.backend.booking.repository.BookingRepository;
import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.venue.dto.admin.AdminVenueResponseDTO;
import com.kstn.group4.backend.venue.dto.admin.VenueDetailResponse;
import com.kstn.group4.backend.venue.entity.Pitch;
import com.kstn.group4.backend.venue.entity.Venue;
import com.kstn.group4.backend.venue.repository.PitchRepository;
import com.kstn.group4.backend.venue.repository.VenueRepository;
import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;
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

    public VenueDetailResponse createVenue(Venue request) {
        if (request.getOpenTime() == null) {
            request.setOpenTime(LocalTime.of(6, 30));
        }
        if (request.getCloseTime() == null) {
            request.setCloseTime(LocalTime.of(23, 0));
        }
        Venue savedVenue = venueRepository.save(request);
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
        return toVenueDetailResponse(updatedVenue);
    }

    public void deleteVenue(Integer venueId) {
        if (!venueRepository.existsById(venueId)) {
            throw new ResourceNotFoundException("Không tìm thấy cụm sân với ID: " + venueId, "Venue");
        }
        venueRepository.deleteById(venueId);
    }

    @Transactional(readOnly = true)
    public Page<AdminVenueResponseDTO> getVenuesByManager(Integer managerId, Pageable pageable) {
        return venueRepository.findAll(pageable)
                .map(this::toAdminVenueResponseWithoutManager);
    }

    @Transactional(readOnly = true)
    public AdminVenueResponseDTO getVenueByManager(Integer venueId, Integer managerId) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cụm sân với ID: " + venueId, "Venue"));
        return toAdminVenueResponseWithoutManager(venue);
    }

    public AdminVenueResponseDTO createVenueByManager(Venue request, Integer managerId) {
        Venue venue = new Venue();
        venue.setName(request.getName());
        venue.setAddress(request.getAddress());
        venue.setDescription(request.getDescription());
        venue.setImageUrl(request.getImageUrl());
        venue.setManagerId(managerId);
        venue.setOpenTime(request.getOpenTime() != null ? request.getOpenTime() : LocalTime.of(6, 30));
        venue.setCloseTime(request.getCloseTime() != null ? request.getCloseTime() : LocalTime.of(23, 0));

        Venue saved = venueRepository.save(venue);
        return toAdminVenueResponse(saved, managerId);
    }

    public AdminVenueResponseDTO updateVenueByManager(Integer venueId, Venue request, Integer managerId) {
        Venue venue = venueRepository.findByIdAndManagerId(venueId, managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cụm sân với ID: " + venueId, "Venue"));

        venue.setName(request.getName());
        venue.setAddress(request.getAddress());
        venue.setDescription(request.getDescription());
        venue.setImageUrl(request.getImageUrl());
        venue.setOpenTime(request.getOpenTime() != null ? request.getOpenTime() : venue.getOpenTime());
        venue.setCloseTime(request.getCloseTime() != null ? request.getCloseTime() : venue.getCloseTime());
        venue.setManagerId(managerId);

        Venue updated = venueRepository.save(venue);
        return toAdminVenueResponse(updated, managerId);
    }

    public void deleteVenueByManager(Integer venueId, Integer managerId) {
        Venue venue = venueRepository.findByIdAndManagerId(venueId, managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cụm sân với ID: " + venueId, "Venue"));
        venueRepository.delete(venue);
    }

    @Transactional(readOnly = true)
    public Page<AdminVenueResponseDTO> getAllVenuesForAdmin(Pageable pageable) {
        return venueRepository.findAll(pageable)
                .map(this::toAdminVenueResponseWithoutManager);
    }

    @Transactional(readOnly = true)
    public AdminVenueResponseDTO getVenueByIdForAdmin(Integer venueId) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cụm sân với ID: " + venueId, "Venue"));
        return toAdminVenueResponseWithoutManager(venue);
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

    private AdminVenueResponseDTO toAdminVenueResponseWithoutManager(Venue venue) {
        long totalPitches = pitchRepository.countByVenueId(venue.getId());
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
