package com.kstn.group4.backend.league.repository;

import com.kstn.group4.backend.league.entity.LeagueAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeagueAnnouncementRepository extends JpaRepository<LeagueAnnouncement, Integer> {
    List<LeagueAnnouncement> findByLeagueIdOrderByCreatedAtDescIdDesc(Integer leagueId);
}
