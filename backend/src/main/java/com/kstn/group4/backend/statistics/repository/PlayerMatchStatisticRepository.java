package com.kstn.group4.backend.statistics.repository;

import com.kstn.group4.backend.statistics.dto.TopPlayerStatDto;
import com.kstn.group4.backend.statistics.entity.PlayerMatchStatistic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlayerMatchStatisticRepository extends JpaRepository<PlayerMatchStatistic, Long> {
    
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM PlayerMatchStatistic p WHERE p.match.id = :matchId")
    void deleteByMatchId(@org.springframework.data.repository.query.Param("matchId") Integer matchId);

    List<PlayerMatchStatistic> findByMatchId(Integer matchId);
    
    @Query("SELECT new com.kstn.group4.backend.statistics.dto.TopPlayerStatDto(p.id, p.username, t.id, t.name, CAST(SUM(s.goals) AS integer)) " +
           "FROM PlayerMatchStatistic s " +
           "JOIN s.player p " +
           "JOIN s.team t " +
           "JOIN s.match m " +
           "WHERE m.league.id = :leagueId " +
           "GROUP BY p.id, p.username, t.id, t.name " +
           "ORDER BY SUM(s.goals) DESC")
    List<TopPlayerStatDto> findTopScorersByLeagueId(@Param("leagueId") Integer leagueId);

    @Query("SELECT new com.kstn.group4.backend.statistics.dto.TopPlayerStatDto(p.id, p.username, t.id, t.name, CAST(SUM(s.assists) AS integer)) " +
           "FROM PlayerMatchStatistic s " +
           "JOIN s.player p " +
           "JOIN s.team t " +
           "JOIN s.match m " +
           "WHERE m.league.id = :leagueId " +
           "GROUP BY p.id, p.username, t.id, t.name " +
           "ORDER BY SUM(s.assists) DESC")
    List<TopPlayerStatDto> findTopAssistsByLeagueId(@Param("leagueId") Integer leagueId);
}
