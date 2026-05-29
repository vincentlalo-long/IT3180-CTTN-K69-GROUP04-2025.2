package com.kstn.group4.backend.team.service;

import com.kstn.group4.backend.config.security.services.UserPrincipal;
import com.kstn.group4.backend.exception.BusinessException;
import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.team.dto.CreateTeamRequest;
import com.kstn.group4.backend.team.dto.TeamResponse;
import com.kstn.group4.backend.team.dto.TeamStatusUpdateRequest;
import com.kstn.group4.backend.team.entity.Team;
import com.kstn.group4.backend.team.entity.TeamMember;
import com.kstn.group4.backend.team.enums.TeamMemberStatus;
import com.kstn.group4.backend.team.enums.TeamStatus;
import com.kstn.group4.backend.team.repository.TeamMemberRepository;
import com.kstn.group4.backend.team.repository.TeamRepository;
import com.kstn.group4.backend.user.entity.User;
import com.kstn.group4.backend.user.repository.UserRepository;
import com.kstn.group4.backend.match.repository.MatchRepository;
import com.kstn.group4.backend.match.entity.Match;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final MatchRepository matchRepository;

    @Transactional
    public TeamResponse createTeam(UserPrincipal userPrincipal, CreateTeamRequest request) {
        User captain = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng", "User"));

        if (teamRepository.findByCaptainId(captain.getId()).isPresent()) {
            throw new BusinessException("Bạn đã là đội trưởng của một đội bóng khác");
        }

        if (teamRepository.existsByName(request.getName())) {
            throw new BusinessException("Tên đội bóng đã được sử dụng");
        }

        Team team = new Team();
        team.setName(request.getName());
        team.setCaptain(captain);
        team.setDescription(request.getDescription());
        team.setStatus(TeamStatus.PENDING);
        team = teamRepository.save(team);

        List<TeamMember> members = new ArrayList<>();
        // Add captain as ACTIVE member
        members.add(new TeamMember(team, captain.getEmail(), TeamMemberStatus.ACTIVE));

        // Add invited members
        if (request.getMemberEmails() != null) {
            for (String email : request.getMemberEmails()) {
                if (email != null && !email.trim().isEmpty() && !email.equalsIgnoreCase(captain.getEmail())) {
                    members.add(new TeamMember(team, email.trim(), TeamMemberStatus.INVITED));
                }
            }
        }

        teamMemberRepository.saveAll(members);

        List<String> emails = members.stream()
                .map(m -> m.getId().getUserEmail())
                .collect(Collectors.toList());

        return new TeamResponse(
                team.getId(),
                team.getName(),
                captain.getId(),
                captain.getUsername(),
                team.getDescription(),
                team.getReputationScore(),
                team.getStatus(),
                null,
                team.getCreatedAt(),
                emails
        );
    }

    @Transactional(readOnly = true)
    public List<TeamResponse> getPendingTeams() {
        return teamRepository.findByStatus(TeamStatus.PENDING).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TeamResponse> getAllTeams() {
        return teamRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TeamResponse updateTeamStatus(Long teamId, TeamStatusUpdateRequest request) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đội bóng với ID: " + teamId, "Team"));

        team.setStatus(request.getStatus());
        teamRepository.save(team);

        if (request.getStatus() == TeamStatus.APPROVED) {
            User captain = team.getCaptain();
            captain.setTeamId(team.getId());
            userRepository.save(captain);
        }

        return mapToResponse(team);
    }

    @Transactional
    public void deleteTeam(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đội bóng với ID: " + teamId, "Team"));

        // 1. Delete or clear matches associated with this team
        List<Match> matches = matchRepository.findByHostOrGuestTeamId(teamId);
        if (!matches.isEmpty()) {
            matchRepository.deleteAll(matches);
        }

        // 2. Clear team_id for all users belonging to this team
        List<User> members = userRepository.findByTeamId(teamId);
        for (User u : members) {
            u.setTeamId(null);
            userRepository.save(u);
        }

        // 3. Delete team members
        teamMemberRepository.deleteByTeamId(teamId);

        // 4. Delete team
        teamRepository.delete(team);
    }

    @Transactional
    public TeamResponse addReputation(Long teamId, Integer amount) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đội bóng với ID: " + teamId, "Team"));
        team.setReputationScore(team.getReputationScore() + amount);
        teamRepository.save(team);
        return mapToResponse(team);
    }

    @Transactional
    public TeamResponse deductReputation(Long teamId, Integer amount) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đội bóng với ID: " + teamId, "Team"));
        team.setReputationScore(Math.max(0, team.getReputationScore() - amount));
        teamRepository.save(team);
        return mapToResponse(team);
    }

    @Transactional
    public TeamResponse banTeam(Long teamId, Integer days) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đội bóng với ID: " + teamId, "Team"));
        team.setStatus(TeamStatus.BANNED);
        team.setBannedUntil(LocalDateTime.now().plusDays(days));
        teamRepository.save(team);
        return mapToResponse(team);
    }

    private TeamResponse mapToResponse(Team team) {
        List<TeamMember> members = teamMemberRepository.findByTeamId(team.getId());
        List<String> memberEmails = members.stream()
                .map(m -> m.getId().getUserEmail())
                .collect(Collectors.toList());

        return new TeamResponse(
                team.getId(),
                team.getName(),
                team.getCaptain().getId(),
                team.getCaptain().getUsername(),
                team.getDescription(),
                team.getReputationScore(),
                team.getStatus(),
                team.getBannedUntil(),
                team.getCreatedAt(),
                memberEmails
        );
    }

    @Transactional(readOnly = true)
    public TeamResponse getMyTeam(UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng", "User"));

        if (user.getTeamId() == null) {
            return null;
        }

        Team team = teamRepository.findById(user.getTeamId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đội bóng với ID: " + user.getTeamId(), "Team"));

        return mapToResponse(team);
    }

    @Transactional(readOnly = true)
    public TeamResponse getTeamDetailsById(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đội bóng với ID: " + teamId, "Team"));
        return mapToResponse(team);
    }

    @Transactional(readOnly = true)
    public List<TeamResponse> getApprovedTeams() {
        return teamRepository.findByStatus(TeamStatus.APPROVED).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
}
