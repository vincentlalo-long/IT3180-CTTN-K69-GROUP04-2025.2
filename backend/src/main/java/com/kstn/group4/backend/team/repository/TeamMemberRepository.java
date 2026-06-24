package com.kstn.group4.backend.team.repository;

import com.kstn.group4.backend.team.entity.TeamMember;
import com.kstn.group4.backend.team.entity.TeamMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, TeamMemberId> {
    List<TeamMember> findByTeamId(Long teamId);
    List<TeamMember> findByTeamIdIn(List<Long> teamIds);
    void deleteByTeamId(Long teamId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM TeamMember tm WHERE LOWER(tm.id.userEmail) = LOWER(:email) AND tm.status <> com.kstn.group4.backend.team.enums.TeamMemberStatus.ACTIVE")
    void deletePendingMembershipsByEmail(String email);
}
