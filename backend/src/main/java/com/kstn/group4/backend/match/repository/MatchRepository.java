package com.kstn.group4.backend.match.repository;

import com.kstn.group4.backend.match.entity.Match;
import com.kstn.group4.backend.match.enums.MatchSkillLevel;
import com.kstn.group4.backend.match.enums.MatchStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MatchRepository extends JpaRepository<Match, Integer> {

    @Query("SELECT m FROM Match m " +
           "LEFT JOIN FETCH m.venue " +
           "LEFT JOIN FETCH m.hostTeam " +
           "LEFT JOIN FETCH m.guestTeam " +
           "WHERE m.status = 'OPEN' " +
           "AND (:venueId IS NULL OR m.venue.id = :venueId) " +
           "AND (:skillLevel IS NULL OR m.skillLevel = :skillLevel)")
    List<Match> findOpenMatches(
        @Param("venueId") Integer venueId,
        @Param("skillLevel") MatchSkillLevel skillLevel
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT m FROM Match m WHERE m.id = :id")
    Optional<Match> findByIdForUpdate(@Param("id") Integer id);

    List<Match> findByStatus(MatchStatus status);

    @Query("SELECT m FROM Match m WHERE m.hostTeam.id = :teamId OR m.guestTeam.id = :teamId")
    List<Match> findByHostOrGuestTeamId(@Param("teamId") Long teamId);
}
