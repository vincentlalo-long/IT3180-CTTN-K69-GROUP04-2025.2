package com.kstn.group4.backend.repository;

import com.kstn.group4.backend.entity.PriceRule;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PriceRuleRepository extends JpaRepository<PriceRule, Integer> {
    List<PriceRule> findByPitchId(Integer pitchId);
}
