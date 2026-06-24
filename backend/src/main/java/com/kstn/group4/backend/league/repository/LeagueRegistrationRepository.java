package com.kstn.group4.backend.league.repository;

import com.kstn.group4.backend.league.entity.LeagueRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LeagueRegistrationRepository extends JpaRepository<LeagueRegistration, Integer> {
    List<LeagueRegistration> findByLeagueId(Integer leagueId);
    List<LeagueRegistration> findByTeamId(Long teamId);
    Optional<LeagueRegistration> findByLeagueIdAndTeamId(Integer leagueId, Long teamId);
}
