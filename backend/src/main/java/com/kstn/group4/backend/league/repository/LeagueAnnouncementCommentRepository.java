package com.kstn.group4.backend.league.repository;

import com.kstn.group4.backend.league.entity.LeagueAnnouncementComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeagueAnnouncementCommentRepository extends JpaRepository<LeagueAnnouncementComment, Integer> {
    List<LeagueAnnouncementComment> findByAnnouncementIdOrderByCreatedAtAsc(Integer announcementId);
}
