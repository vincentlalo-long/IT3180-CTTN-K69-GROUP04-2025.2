package com.kstn.group4.backend.venue.service.admin;

import com.kstn.group4.backend.exception.BusinessException;
import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.venue.dto.admin.PitchDetailResponse;
import com.kstn.group4.backend.venue.dto.admin.PitchUpsertRequest;
import com.kstn.group4.backend.venue.dto.admin.SlotPriceRequest;
import com.kstn.group4.backend.venue.entity.Pitch;
import com.kstn.group4.backend.venue.entity.PitchType;
import com.kstn.group4.backend.venue.entity.PriceRule;
import com.kstn.group4.backend.venue.entity.Venue;
import com.kstn.group4.backend.venue.repository.PitchRepository;
import com.kstn.group4.backend.venue.repository.PriceRuleRepository;
import com.kstn.group4.backend.venue.repository.VenueRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.HashMap;
import java.util.Objects;
import com.kstn.group4.backend.activitylog.service.ActivityLogService;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class PitchService {

    private static final int MIN_SLOT = 1;
    private static final int MAX_SLOT = 11;

    private final PitchRepository pitchRepository;
    private final VenueRepository venueRepository;
    private final PriceRuleRepository priceRuleRepository;
    private final ActivityLogService activityLogService;

    private void logPitchActivity(String actionType, String targetId, String description, String oldValue, String newValue) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        Integer adminId = null;
        String adminName = "System";
        if (auth != null && auth.getPrincipal() instanceof com.kstn.group4.backend.config.security.services.UserPrincipal principal) {
            adminId = principal.getId();
            adminName = principal.getAppUsername();
        }
        activityLogService.log(adminId, adminName, actionType, "PITCH", targetId, description, oldValue, newValue);
    }

    @Transactional(readOnly = true)
    public Page<PitchDetailResponse> getPitchesByVenueForManager(Integer venueId, Integer managerId, Pageable pageable) {
        Venue venue = venueRepository.findById(venueId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cụm sân với ID: " + venueId, "Venue"));

        Page<Pitch> pitchesPage = pitchRepository.findByVenueIdWithVenue(venue.getId(), pageable);

        List<Integer> pitchIds = pitchesPage.getContent().stream()
            .map(Pitch::getId)
            .toList();

        Map<Integer, List<PriceRule>> rulesByPitchId = new HashMap<>();
        if (!pitchIds.isEmpty()) {
            List<PriceRule> allRules = priceRuleRepository.findByPitchIdInOrderBySlotNumberAscIsWeekendAsc(pitchIds);
            for (PriceRule rule : allRules) {
                rulesByPitchId.computeIfAbsent(rule.getPitch().getId(), k -> new ArrayList<>()).add(rule);
            }
        }

        return pitchesPage.map(pitch -> {
            List<PriceRule> rules = rulesByPitchId.getOrDefault(pitch.getId(), List.of());
            return new PitchDetailResponse(
                pitch.getId(),
                pitch.getName(),
                pitch.getPitchType(),
                pitch.getIsActive(),
                pitch.getVenue() != null ? pitch.getVenue().getId() : null,
                pitch.getVenue() != null ? pitch.getVenue().getName() : null,
                pitch.getBasePrice(),
                toSlotPriceTable(rules, pitch.getBasePrice())
            );
        });
    }

    @Transactional(readOnly = true)
    public PitchDetailResponse getPitchDetailForManager(Integer pitchId, Integer managerId) {
        Pitch pitch = pitchRepository.findById(pitchId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sân với ID: " + pitchId, "Pitch"));

        List<PriceRule> rules = priceRuleRepository.findByPitchIdOrderBySlotNumberAscIsWeekendAsc(pitch.getId());

        return new PitchDetailResponse(
            pitch.getId(),
            pitch.getName(),
            pitch.getPitchType(),
            pitch.getIsActive(),
            pitch.getVenue() != null ? pitch.getVenue().getId() : null,
            pitch.getVenue() != null ? pitch.getVenue().getName() : null,
            pitch.getBasePrice(),
            toSlotPriceTable(rules, pitch.getBasePrice())
        );
    }

    public PitchDetailResponse addPitchToVenueForManager(Integer venueId, PitchUpsertRequest request, Integer managerId) {
        Venue venue = venueRepository.findById(venueId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cụm sân với ID: " + venueId, "Venue"));

        PitchType pitchType = parsePitchType(request.pitchType());

        Pitch pitch = new Pitch();
        pitch.setName(request.name());
        pitch.setPitchType(pitchType);
        pitch.setIsActive(request.isActive() != null ? request.isActive() : Boolean.TRUE);
        pitch.setVenue(venue);

        // Đặt basePrice từ giá weekday của slot đầu tiên nếu có
        if (request.slotPrices() != null && !request.slotPrices().isEmpty()) {
            pitch.setBasePrice(request.slotPrices().get(0).weekdayPrice());
        }

        Pitch savedPitch = pitchRepository.save(pitch);
        logPitchActivity("CREATE_PITCH", savedPitch.getId().toString(), "Tạo sân con: " + savedPitch.getName(), null, null);

        // Cascade: Tạo PriceRule cho mỗi slot (weekday + weekend)
        savePriceRulesForPitch(savedPitch, request.slotPrices());

        return getPitchDetailForManager(savedPitch.getId(), managerId);
    }

    public PitchDetailResponse updatePitchForManager(Integer pitchId, PitchUpsertRequest request, Integer managerId) {
        Pitch pitch = pitchRepository.findById(pitchId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sân với ID: " + pitchId, "Pitch"));

        // 1. Lưu lại trạng thái CŨ trước khi sửa
        String oldName = pitch.getName();
        String oldType = pitch.getPitchType() != null ? pitch.getPitchType().name() : null;
        Boolean oldIsActive = pitch.getIsActive();
        BigDecimal oldPrice = pitch.getBasePrice();

        PitchType pitchType = parsePitchType(request.pitchType());

        pitch.setName(request.name());
        pitch.setPitchType(pitchType);
        pitch.setIsActive(request.isActive() != null ? request.isActive() : pitch.getIsActive());

        if (request.slotPrices() != null && !request.slotPrices().isEmpty()) {
            pitch.setBasePrice(request.slotPrices().get(0).weekdayPrice());
        }

        // 2. Thu thập trạng thái MỚI
        String newName = request.name();
        String newType = request.pitchType();
        Boolean newIsActive = request.isActive() != null ? request.isActive() : oldIsActive;
        BigDecimal newPrice = (request.slotPrices() != null && !request.slotPrices().isEmpty()) 
                                ? request.slotPrices().get(0).weekdayPrice() : oldPrice;

        // 3. Xây dựng JSON diff
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> oldMap = new HashMap<>();
        Map<String, Object> newMap = new HashMap<>();

        if (!Objects.equals(oldName, newName)) { oldMap.put("name", oldName); newMap.put("name", newName); }
        if (!Objects.equals(oldType, newType)) { oldMap.put("pitchType", oldType); newMap.put("pitchType", newType); }
        if (!Objects.equals(oldIsActive, newIsActive)) { oldMap.put("isActive", oldIsActive); newMap.put("isActive", newIsActive); }
        if (oldPrice != null && newPrice != null && oldPrice.compareTo(newPrice) != 0) {
            oldMap.put("basePrice", oldPrice); newMap.put("basePrice", newPrice);
        }

        String oldValJson = null;
        String newValJson = null;
        if (!oldMap.isEmpty()) {
            try {
                oldValJson = mapper.writeValueAsString(oldMap);
                newValJson = mapper.writeValueAsString(newMap);
            } catch (Exception e) {
                // Ignore serialization exceptions
            }
        }

        Pitch updated = pitchRepository.save(pitch);

        if (oldValJson != null) {
            logPitchActivity("UPDATE_PITCH", pitchId.toString(), "Cập nhật thông tin sân con: " + newName, oldValJson, newValJson);
        }

        // Xóa PriceRule cũ rồi tạo mới — orphanRemoval trên entity sẽ tự cleanup
        pitch.getPriceRules().clear();
        pitchRepository.flush();

        savePriceRulesForPitch(updated, request.slotPrices());

        return getPitchDetailForManager(updated.getId(), managerId);
    }

    public void deletePitchForManager(Integer pitchId, Integer managerId) {
        Pitch pitch = pitchRepository.findById(pitchId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sân với ID: " + pitchId, "Pitch"));
        pitchRepository.delete(pitch);
        logPitchActivity("DELETE_PITCH", pitchId.toString(), "Xóa sân con: " + pitch.getName(), null, null);
    }

    public PitchDetailResponse addPitchToVenue(Integer venueId, Pitch request) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cụm sân với ID: " + venueId, "Venue"));

        Pitch pitch = new Pitch();
        pitch.setName(request.getName());
        pitch.setPitchType(request.getPitchType());
        pitch.setIsActive(request.getIsActive() != null ? request.getIsActive() : Boolean.TRUE);
        pitch.setBasePrice(request.getBasePrice());
        pitch.setVenue(venue);

        Pitch savedPitch = pitchRepository.save(pitch);
        logPitchActivity("CREATE_PITCH", savedPitch.getId().toString(), "Tạo sân con: " + savedPitch.getName(), null, null);
        return getPitchDetail(savedPitch.getId());
    }

    @Transactional(readOnly = true)
    public BigDecimal calculatePrice(Integer pitchId, Integer slotNumber, LocalDate date) {
        validateSlotNumber(slotNumber);

        if (date == null) {
            throw new BusinessException("Ngày thi đấu không được để trống", "INVALID_DATE");
        }

        Pitch pitch = pitchRepository.findById(pitchId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sân với ID: " + pitchId, "Pitch"));

        boolean isWeekend = isWeekend(date);

        BigDecimal coefficient = priceRuleRepository.findByPitchIdAndSlotNumberAndIsWeekend(pitchId, slotNumber, isWeekend)
                .map(PriceRule::getCoefficient)
                .orElseThrow(() -> new BusinessException(
                        "Không tìm thấy luật giá cho sân " + pitchId + ", ca " + slotNumber + ", ngày " + (isWeekend ? "cuối tuần" : "thường"),
                        "PRICE_RULE_NOT_FOUND"
                ));
        return pitch.getBasePrice() != null ? pitch.getBasePrice().multiply(coefficient) : BigDecimal.ZERO;
    }

    @Transactional(readOnly = true)
    public PitchDetailResponse getPitchDetail(Integer pitchId) {
        Pitch pitch = pitchRepository.findByIdWithDetails(pitchId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sân với ID: " + pitchId, "Pitch"));

        List<PriceRule> rules = priceRuleRepository.findByPitchIdOrderBySlotNumberAscIsWeekendAsc(pitchId);

        return new PitchDetailResponse(
                pitch.getId(),
                pitch.getName(),
                pitch.getPitchType(),
                pitch.getIsActive(),
                pitch.getVenue() != null ? pitch.getVenue().getId() : null,
                pitch.getVenue() != null ? pitch.getVenue().getName() : null,
                pitch.getBasePrice(),
                toSlotPriceTable(rules, pitch.getBasePrice())
        );
    }
  
    // ─── Private helpers ────────────────────────────────────────────────

    private void savePriceRulesForPitch(Pitch pitch, List<SlotPriceRequest> slotPrices) {
        if (slotPrices == null || slotPrices.isEmpty()) {
            return;
        }

        List<PriceRule> rulesToSave = new ArrayList<>();
        BigDecimal basePrice = pitch.getBasePrice();
        if (basePrice == null || basePrice.compareTo(BigDecimal.ZERO) <= 0) {
            basePrice = BigDecimal.ONE;
        }

        for (SlotPriceRequest slot : slotPrices) {
            if (slot.slotNumber() == null || slot.slotNumber() < MIN_SLOT || slot.slotNumber() > MAX_SLOT) {
                continue;
            }

            // PriceRule cho ngày thường (weekday)
            if (slot.weekdayPrice() != null) {
                PriceRule weekdayRule = new PriceRule();
                weekdayRule.setPitch(pitch);
                weekdayRule.setSlotNumber(slot.slotNumber());
                weekdayRule.setIsWeekend(Boolean.FALSE);
                weekdayRule.setCoefficient(slot.weekdayPrice().divide(basePrice, 2, java.math.RoundingMode.HALF_UP));
                rulesToSave.add(weekdayRule);
            }

            // PriceRule cho cuối tuần (weekend)
            if (slot.weekendPrice() != null) {
                PriceRule weekendRule = new PriceRule();
                weekendRule.setPitch(pitch);
                weekendRule.setSlotNumber(slot.slotNumber());
                weekendRule.setIsWeekend(Boolean.TRUE);
                weekendRule.setCoefficient(slot.weekendPrice().divide(basePrice, 2, java.math.RoundingMode.HALF_UP));
                rulesToSave.add(weekendRule);
            }
        }

        priceRuleRepository.saveAll(rulesToSave);
    }

    private PitchType parsePitchType(String pitchTypeStr) {
        if (pitchTypeStr == null || pitchTypeStr.isBlank()) {
            return PitchType.SAN_7; // default
        }

        return switch (pitchTypeStr.trim().toUpperCase()) {
            case "SAN_5", "5VS5", "5" -> PitchType.SAN_5;
            case "SAN_11", "11VS11", "11" -> PitchType.SAN_11;
            default -> PitchType.SAN_7;
        };
    }

    private List<PitchDetailResponse.SlotPriceResponse> toSlotPriceTable(List<PriceRule> rules, BigDecimal basePrice) {
        List<PriceRule> safeRules = rules == null ? List.of() : rules.stream()
                .sorted(Comparator.comparing(PriceRule::getSlotNumber).thenComparing(PriceRule::getIsWeekend))
                .toList();

        List<PitchDetailResponse.SlotPriceResponse> table = new ArrayList<>();
        for (int slot = MIN_SLOT; slot <= MAX_SLOT; slot++) {

            final int currentSlot = slot;

            BigDecimal weekdayPrice = safeRules.stream()
                    .filter(rule -> currentSlot == rule.getSlotNumber() && Boolean.FALSE.equals(rule.getIsWeekend()))
                    .map(PriceRule::getCoefficient)
                    .map(coeff -> basePrice != null ? basePrice.multiply(coeff) : null)
                    .findFirst()
                    .orElse(null);

            BigDecimal weekendPrice = safeRules.stream()
                    .filter(rule -> currentSlot == rule.getSlotNumber() && Boolean.TRUE.equals(rule.getIsWeekend()))
                    .map(PriceRule::getCoefficient)
                    .map(coeff -> basePrice != null ? basePrice.multiply(coeff) : null)
                    .findFirst()
                    .orElse(null);

            table.add(new PitchDetailResponse.SlotPriceResponse(currentSlot, weekdayPrice, weekendPrice));
        }
        return table;
    }

    private void validateSlotNumber(Integer slotNumber) {
        if (slotNumber == null || slotNumber < MIN_SLOT || slotNumber > MAX_SLOT) {
            throw new BusinessException("slotNumber phải nằm trong khoảng 1-11", "INVALID_SLOT_NUMBER");
        }
    }

    private boolean isWeekend(LocalDate date) {
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        return dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY;
    }
}