package com.kstn.group4.backend.team.repository;

import com.kstn.group4.backend.team.entity.TeamMember;
import com.kstn.group4.backend.team.entity.TeamMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, TeamMemberId> {
    List<TeamMember> findByTeamId(Long teamId);
    void deleteByTeamId(Long teamId);
}
