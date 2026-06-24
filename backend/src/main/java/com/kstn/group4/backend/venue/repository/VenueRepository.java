package com.kstn.group4.backend.venue.repository;

import com.kstn.group4.backend.venue.entity.Venue;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VenueRepository extends JpaRepository<Venue, Integer> {

    @Query("SELECT DISTINCT v FROM Venue v LEFT JOIN FETCH v.pitches WHERE v.id = :id")
    Optional<Venue> findByIdWithPitches(@Param("id") Integer id);

    @Query("SELECT DISTINCT v FROM Venue v LEFT JOIN FETCH v.pitches")
    List<Venue> findAllWithPitches();

        @Query(
            value = "SELECT DISTINCT v FROM Venue v JOIN v.pitches p WHERE p.isActive = true ORDER BY v.id DESC",
            countQuery = "SELECT COUNT(DISTINCT v.id) FROM Venue v JOIN v.pitches p WHERE p.isActive = true"
        )
        Page<Venue> findActiveVenuesForPlayer(Pageable pageable);

        @Query(
            value = "SELECT v FROM Venue v WHERE v.managerId = :managerId ORDER BY v.id DESC",
            countQuery = "SELECT COUNT(v) FROM Venue v WHERE v.managerId = :managerId"
        )
        Page<Venue> findByManagerId(@Param("managerId") Integer managerId, Pageable pageable);

        Optional<Venue> findByIdAndManagerId(Integer id, Integer managerId);

    @Query(value = "SELECT DISTINCT v FROM Venue v JOIN v.pitches p WHERE p.isActive = true AND " +
            "v.latitude IS NOT NULL AND v.longitude IS NOT NULL AND " +
            "(6371 * acos(cos(radians(:lat)) * cos(radians(v.latitude)) * " +
            "cos(radians(v.longitude) - radians(:lng)) + " +
            "sin(radians(:lat)) * sin(radians(v.latitude)))) <= :radius " +
            "ORDER BY (6371 * acos(cos(radians(:lat)) * cos(radians(v.latitude)) * " +
            "cos(radians(v.longitude) - radians(:lng)) + " +
            "sin(radians(:lat)) * sin(radians(v.latitude)))) ASC",
            countQuery = "SELECT COUNT(DISTINCT v.id) FROM Venue v JOIN v.pitches p WHERE p.isActive = true AND " +
                    "v.latitude IS NOT NULL AND v.longitude IS NOT NULL AND " +
                    "(6371 * acos(cos(radians(:lat)) * cos(radians(v.latitude)) * " +
                    "cos(radians(v.longitude) - radians(:lng)) + " +
                    "sin(radians(:lat)) * sin(radians(v.latitude)))) <= :radius")
    Page<Venue> findVenuesWithinRadius(@Param("lat") Double lat,
                                       @Param("lng") Double lng,
                                       @Param("radius") Double radius,
                                       Pageable pageable);

    @Query(value = "SELECT DISTINCT v FROM Venue v JOIN v.pitches p WHERE p.isActive = true AND " +
            "v.latitude BETWEEN :minLat AND :maxLat AND v.longitude BETWEEN :minLng AND :maxLng",
            countQuery = "SELECT COUNT(DISTINCT v.id) FROM Venue v JOIN v.pitches p WHERE p.isActive = true AND " +
                    "v.latitude BETWEEN :minLat AND :maxLat AND v.longitude BETWEEN :minLng AND :maxLng")
    Page<Venue> findVenuesInBoundingBox(@Param("minLat") Double minLat,
                                        @Param("maxLat") Double maxLat,
                                        @Param("minLng") Double minLng,
                                        @Param("maxLng") Double maxLng,
                                        Pageable pageable);
}
