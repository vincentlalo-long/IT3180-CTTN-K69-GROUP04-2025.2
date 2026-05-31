package com.kstn.group4.backend.match.repository;

import com.kstn.group4.backend.match.entity.MatchRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MatchRequestRepository extends JpaRepository<MatchRequest, Integer> {
    List<MatchRequest> findByMatchId(Integer matchId);
    List<MatchRequest> findByGuestTeamId(Long guestTeamId);
}
