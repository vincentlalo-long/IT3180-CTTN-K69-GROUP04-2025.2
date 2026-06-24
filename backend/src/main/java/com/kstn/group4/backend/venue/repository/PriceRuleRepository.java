package com.kstn.group4.backend.venue.repository;

import com.kstn.group4.backend.venue.entity.PriceRule;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PriceRuleRepository extends JpaRepository<PriceRule, Integer> {

    List<PriceRule> findByPitchId(Integer pitchId);

    Optional<PriceRule> findByPitchIdAndSlotNumberAndIsWeekend(Integer pitchId, Integer slotNumber, Boolean isWeekend);

    List<PriceRule> findByPitchIdOrderBySlotNumberAscIsWeekendAsc(Integer pitchId);

    @Query("SELECT pr FROM PriceRule pr WHERE pr.pitch.id IN :pitchIds ORDER BY pr.slotNumber ASC, pr.isWeekend ASC")
    List<PriceRule> findByPitchIdInOrderBySlotNumberAscIsWeekendAsc(@Param("pitchIds") List<Integer> pitchIds);
}