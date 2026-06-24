package com.kstn.group4.backend.team.repository;

import com.kstn.group4.backend.team.entity.Team;
import com.kstn.group4.backend.team.enums.TeamStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {

    @EntityGraph(attributePaths = {"captain"})
    List<Team> findByStatus(TeamStatus status);

    Optional<Team> findByCaptainId(Integer captainId);

    boolean existsByName(String name);

    @Override
    @EntityGraph(attributePaths = {"captain"})
    List<Team> findAll();
}
