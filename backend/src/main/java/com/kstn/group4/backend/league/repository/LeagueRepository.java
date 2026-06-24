package com.kstn.group4.backend.league.repository;

import com.kstn.group4.backend.league.entity.League;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeagueRepository extends JpaRepository<League, Integer> {
    List<League> findByManagerId(Integer managerId);
}
