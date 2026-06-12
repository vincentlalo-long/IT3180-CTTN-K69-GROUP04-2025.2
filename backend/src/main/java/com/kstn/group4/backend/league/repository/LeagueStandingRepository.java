package com.kstn.group4.backend.league.repository;

import com.kstn.group4.backend.league.entity.LeagueStanding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeagueStandingRepository extends JpaRepository<LeagueStanding, Long> {
    Optional<LeagueStanding> findByLeagueIdAndTeamId(Integer leagueId, Long teamId);
    List<LeagueStanding> findByLeagueIdOrderByPointsDescGoalDifferenceDescGoalsForDesc(Integer leagueId);
}
