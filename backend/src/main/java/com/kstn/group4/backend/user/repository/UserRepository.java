package com.kstn.group4.backend.user.repository;

import com.kstn.group4.backend.user.entity.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    Optional <User> findByUsername(String username);
    Boolean existsByEmail(String email);
    Boolean existsByUsername(String username);
    List<User> findByIdIn(List<Integer> ids);
    List<User> findByTeamId(Long teamId);
}
