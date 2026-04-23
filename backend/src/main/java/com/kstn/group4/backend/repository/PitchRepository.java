package com.kstn.group4.backend.repository;

import com.kstn.group4.backend.entity.Pitch;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PitchRepository extends JpaRepository<Pitch, Integer> {

    @Query("""
            SELECT p FROM Pitch p
            WHERE (:pitchType IS NULL OR LOWER(p.pitchType) = LOWER(:pitchType))
              AND (:surfaceType IS NULL OR LOWER(p.surfaceType) = LOWER(:surfaceType))
              AND (:address IS NULL OR LOWER(p.address) LIKE LOWER(CONCAT('%', :address, '%')))
            """)
    List<Pitch> search(@Param("pitchType") String pitchType,
                       @Param("surfaceType") String surfaceType,
                       @Param("address") String address);

    List<Pitch> findByManagerId(Integer managerId);

    @Query("""
            SELECT COUNT(p)
            FROM Pitch p
            WHERE p.manager.id = :managerId
              AND UPPER(p.status) IN :activeStatuses
            """)
    int countActiveByManagerId(@Param("managerId") Integer managerId,
                               @Param("activeStatuses") List<String> activeStatuses);

    @Query("""
            SELECT COUNT(p)
            FROM Pitch p
            WHERE p.id = :id
              AND p.manager.id = :managerId
              AND UPPER(p.status) IN :activeStatuses
            """)
    int countActiveByIdAndManagerId(@Param("id") Integer id,
                                    @Param("managerId") Integer managerId,
                                    @Param("activeStatuses") List<String> activeStatuses);

    Optional<Pitch> findByIdAndManagerId(Integer id, Integer managerId);

    @EntityGraph(attributePaths = {"priceRules", "services"})
    @Query("SELECT p FROM Pitch p WHERE p.id = :id")
    Optional<Pitch> findByIdWithDetails(@Param("id") Integer id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Pitch p WHERE p.id = :id")
    Optional<Pitch> findByIdForUpdate(@Param("id") Integer id);
}

