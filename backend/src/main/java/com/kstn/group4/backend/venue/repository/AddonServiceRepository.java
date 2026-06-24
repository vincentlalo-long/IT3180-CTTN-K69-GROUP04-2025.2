package com.kstn.group4.backend.venue.repository;

import com.kstn.group4.backend.venue.entity.AddonService;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AddonServiceRepository extends JpaRepository<AddonService, Integer> {
    List<AddonService> findByPitchId(Integer pitchId);

    List<AddonService> findByVenueId(Integer venueId);

    @Query("SELECT s FROM AddonService s " +
            "LEFT JOIN FETCH s.venue " +
            "LEFT JOIN FETCH s.pitch p " +
            "LEFT JOIN FETCH p.venue " +
            "WHERE s.venue.id = :venueId OR p.venue.id = :venueId")
    List<AddonService> findByVenueIdIncludingPitch(@Param("venueId") Integer venueId);

    List<AddonService> findByVenueIdAndStatusIgnoreCase(Integer venueId, String status);

    @Query("SELECT s FROM AddonService s " +
            "LEFT JOIN FETCH s.venue " +
            "LEFT JOIN FETCH s.pitch p " +
            "LEFT JOIN FETCH p.venue " +
            "WHERE (s.venue.id = :venueId OR p.venue.id = :venueId) " +
            "AND UPPER(COALESCE(s.status, 'ACTIVE')) = UPPER(:status)")
    List<AddonService> findActiveByVenueIdIncludingPitch(
            @Param("venueId") Integer venueId,
            @Param("status") String status
    );

    @Query("SELECT s FROM AddonService s " +
            "LEFT JOIN FETCH s.venue " +
            "LEFT JOIN FETCH s.pitch p " +
            "LEFT JOIN FETCH p.venue " +
            "WHERE s.id IN :ids")
    List<AddonService> findAllByIdWithVenueOrPitch(@Param("ids") List<Integer> ids);
}
