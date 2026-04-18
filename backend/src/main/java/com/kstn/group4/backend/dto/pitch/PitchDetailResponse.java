package com.kstn.group4.backend.dto.pitch;

import java.math.BigDecimal;
import java.util.List;
import lombok.Builder;

@Builder
public record PitchDetailResponse(
        Integer id,
        String name,
        String address,
        String pitchType,
        String surfaceType,
        BigDecimal basePrice,
        String imageUrl,
        List<PriceRuleResponse> priceRules,
        List<AddonServiceResponse> services
) {
}
