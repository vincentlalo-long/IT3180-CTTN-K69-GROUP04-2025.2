package com.kstn.group4.backend.user.repository;

import com.kstn.group4.backend.user.entity.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    Optional <User> findByUsername(String username);
    Boolean existsByEmail(String email);
    Boolean existsByUsername(String username);
    List<User> findByIdIn(List<Integer> ids);
    List<User> findByTeamId(Long teamId);

    List<User> findByRole(String role);

    @Modifying
    @Query("UPDATE User u SET u.membershipPoints = u.membershipPoints - :points WHERE u.id = :userId AND u.membershipPoints >= :points")
    int deductMembershipPoints(@Param("userId") Integer userId, @Param("points") Integer points);

    @Modifying
    @Query("UPDATE User u SET u.membershipPoints = COALESCE(u.membershipPoints, 0) + :points WHERE u.id = :userId")
    int incrementMembershipPoints(@Param("userId") Integer userId, @Param("points") Integer points);
}
