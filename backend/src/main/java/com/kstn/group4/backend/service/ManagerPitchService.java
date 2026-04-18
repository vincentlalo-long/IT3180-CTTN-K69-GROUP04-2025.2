package com.kstn.group4.backend.service;

import com.kstn.group4.backend.dto.pitch.AddonServiceResponse;
import com.kstn.group4.backend.dto.pitch.ManagerAddPriceRuleRequest;
import com.kstn.group4.backend.dto.pitch.ManagerAddServiceRequest;
import com.kstn.group4.backend.dto.pitch.ManagerCreatePitchRequest;
import com.kstn.group4.backend.dto.pitch.ManagerUpdatePitchRequest;
import com.kstn.group4.backend.dto.pitch.PitchSummaryResponse;
import com.kstn.group4.backend.dto.pitch.PriceRuleResponse;
import com.kstn.group4.backend.entity.AddonService;
import com.kstn.group4.backend.entity.Pitch;
import com.kstn.group4.backend.entity.PriceRule;
import com.kstn.group4.backend.entity.User;
import com.kstn.group4.backend.exception.BadRequestException;
import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.repository.AddonServiceRepository;
import com.kstn.group4.backend.repository.PitchRepository;
import com.kstn.group4.backend.repository.PriceRuleRepository;
import com.kstn.group4.backend.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ManagerPitchService {

    private final PitchRepository pitchRepository;
    private final UserRepository userRepository;
    private final AddonServiceRepository addonServiceRepository;
    private final PriceRuleRepository priceRuleRepository;

    @Transactional
    public PitchSummaryResponse createPitch(Integer managerId, ManagerCreatePitchRequest request) {
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ sân với id: " + managerId));

        validateRole(manager.getRole());

        Pitch pitch = new Pitch();
        pitch.setManager(manager);
        pitch.setName(request.name());
        pitch.setAddress(request.address());
        pitch.setPitchType(request.pitchType());
        pitch.setSurfaceType(request.surfaceType());
        pitch.setBasePrice(request.basePrice());
        pitch.setImageUrl(request.imageUrl());

        Pitch saved = pitchRepository.save(pitch);
        return toPitchSummary(saved);
    }

    @Transactional(readOnly = true)
    public List<PitchSummaryResponse> getOwnedPitches(Integer managerId) {
        return pitchRepository.findByManagerId(managerId).stream()
                .map(this::toPitchSummary)
                .toList();
    }

    @Transactional
    public PitchSummaryResponse updatePitch(Integer managerId, Integer pitchId, ManagerUpdatePitchRequest request) {
        Pitch pitch = requireOwnedPitch(managerId, pitchId);

        if (request.name() != null) {
            pitch.setName(request.name());
        }
        if (request.address() != null) {
            pitch.setAddress(request.address());
        }
        if (request.pitchType() != null) {
            pitch.setPitchType(request.pitchType());
        }
        if (request.surfaceType() != null) {
            pitch.setSurfaceType(request.surfaceType());
        }
        if (request.basePrice() != null) {
            pitch.setBasePrice(request.basePrice());
        }
        if (request.imageUrl() != null) {
            pitch.setImageUrl(request.imageUrl());
        }

        return toPitchSummary(pitchRepository.save(pitch));
    }

    @Transactional
    public AddonServiceResponse addService(Integer managerId, Integer pitchId, ManagerAddServiceRequest request) {
        Pitch pitch = requireOwnedPitch(managerId, pitchId);

        AddonService service = new AddonService();
        service.setPitch(pitch);
        service.setName(request.name());
        service.setPrice(request.price());
        service.setUnit(request.unit());

        AddonService saved = addonServiceRepository.save(service);

        return AddonServiceResponse.builder()
                .id(saved.getId())
                .name(saved.getName())
                .price(saved.getPrice())
                .unit(saved.getUnit())
                .build();
    }

    @Transactional
    public PriceRuleResponse addPriceRule(Integer managerId, Integer pitchId, ManagerAddPriceRuleRequest request) {
        if (!request.startTime().isBefore(request.endTime())) {
            throw new BadRequestException("Khung giờ giá không hợp lệ: start_time phải nhỏ hơn end_time");
        }

        Pitch pitch = requireOwnedPitch(managerId, pitchId);

        PriceRule priceRule = new PriceRule();
        priceRule.setPitch(pitch);
        priceRule.setDayOfWeek(request.dayOfWeek());
        priceRule.setStartTime(request.startTime());
        priceRule.setEndTime(request.endTime());
        priceRule.setPrice(request.price());

        PriceRule saved = priceRuleRepository.save(priceRule);

        return PriceRuleResponse.builder()
                .id(saved.getId())
                .dayOfWeek(saved.getDayOfWeek())
                .startTime(saved.getStartTime())
                .endTime(saved.getEndTime())
                .price(saved.getPrice())
                .build();
    }

    private Pitch requireOwnedPitch(Integer managerId, Integer pitchId) {
        return pitchRepository.findByIdAndManagerId(pitchId, managerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy sân với id " + pitchId + " thuộc manager " + managerId));
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

    private void validateRole(String role) {
        if (role == null || !"manager".equalsIgnoreCase(role)) {
            throw new BadRequestException("Người dùng hiện tại không phải vai trò manager");
        }
    }
}
