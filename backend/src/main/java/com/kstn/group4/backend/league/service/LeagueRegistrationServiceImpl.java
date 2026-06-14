package com.kstn.group4.backend.league.service;

import com.kstn.group4.backend.exception.BusinessException;
import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.league.dto.RegistrationResponse;
import com.kstn.group4.backend.league.entity.League;
import com.kstn.group4.backend.league.entity.LeagueRegistration;
import com.kstn.group4.backend.league.enums.LeagueStatus;
import com.kstn.group4.backend.league.enums.RegistrationStatus;
import com.kstn.group4.backend.league.repository.LeagueRegistrationRepository;
import com.kstn.group4.backend.league.repository.LeagueRepository;
import com.kstn.group4.backend.team.entity.Team;
import com.kstn.group4.backend.team.repository.TeamRepository;
import com.kstn.group4.backend.user.entity.User;
import com.kstn.group4.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

import com.kstn.group4.backend.notification.entity.NotificationType;
import com.kstn.group4.backend.notification.service.NotificationService;

@Service
@RequiredArgsConstructor
public class LeagueRegistrationServiceImpl implements LeagueRegistrationService {

    private final LeagueRegistrationRepository registrationRepository;
    private final LeagueRepository leagueRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public RegistrationResponse registerTeam(Integer leagueId, Long teamId, Integer userId) {
        League league = leagueRepository.findById(leagueId)
                .orElseThrow(() -> new ResourceNotFoundException("League not found"));
        
        if (league.getStatus() != LeagueStatus.OPENING) {
            throw new BusinessException("League is not opening for registration");
        }

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

        if (!team.getCaptain().getId().equals(userId)) {
            throw new BusinessException("Only team captain can register for league");
        }

        registrationRepository.findByLeagueIdAndTeamId(leagueId, teamId)
                .ifPresent(r -> {
                    throw new BusinessException("Team already registered for this league");
                });

        LeagueRegistration registration = new LeagueRegistration();
        registration.setLeague(league);
        registration.setTeam(team);
        registration.setCaptain(team.getCaptain());
        registration.setStatus(RegistrationStatus.PENDING);

        LeagueRegistration saved = registrationRepository.save(registration);

        // Gửi thông báo cho Admin: có đội đăng ký giải đấu mới
        notificationService.createNotificationForAdmins(
                NotificationType.ADMIN_ALERT,
                "Yêu cầu tham gia giải đấu",
                "Đội bóng '" + team.getName() + "' đã đăng ký tham gia giải đấu '" + league.getName() + "'.",
                "LEAGUE",
                String.valueOf(leagueId)
        );

        return mapToResponse(saved);
    }

    @Override
    public List<RegistrationResponse> getRegistrationsByLeague(Integer leagueId) {
        return registrationRepository.findByLeagueId(leagueId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RegistrationResponse updateRegistrationStatus(Integer registrationId, RegistrationStatus status, Integer managerId) {
        LeagueRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));

        if (!registration.getLeague().getManager().getId().equals(managerId)) {
            throw new BusinessException("Only league manager can update registration status");
        }

        registration.setStatus(status);
        LeagueRegistration updated = registrationRepository.save(registration);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteRegistration(Integer registrationId, Integer userId) {
        LeagueRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));

        if (!registration.getCaptain().getId().equals(userId) && 
            !registration.getLeague().getManager().getId().equals(userId)) {
            throw new BusinessException("You don't have permission to delete this registration");
        }

        registrationRepository.delete(registration);
    }

    @Override
    @Transactional
    public void finalizeRegistration(Integer leagueId, Integer managerId) {
        League league = leagueRepository.findById(leagueId)
                .orElseThrow(() -> new ResourceNotFoundException("League not found"));

        if (!league.getManager().getId().equals(managerId)) {
            throw new BusinessException("Only league manager can finalize registration");
        }

        if (league.getStatus() != LeagueStatus.OPENING) {
            throw new BusinessException("League is not in OPENING status");
        }

        List<LeagueRegistration> registrations = registrationRepository.findByLeagueId(leagueId);
        long approvedCount = registrations.stream()
                .filter(r -> r.getStatus() == RegistrationStatus.APPROVED)
                .count();

        if (approvedCount < 2) {
            throw new BusinessException("At least 2 teams must be approved to start the league");
        }

        // Reject all pending registrations
        registrations.stream()
                .filter(r -> r.getStatus() == RegistrationStatus.PENDING)
                .forEach(r -> r.setStatus(RegistrationStatus.REJECTED));

        league.setStatus(LeagueStatus.IN_PROGRESS);
        leagueRepository.save(league);
        registrationRepository.saveAll(registrations);
    }

    private RegistrationResponse mapToResponse(LeagueRegistration registration) {
        return RegistrationResponse.builder()
                .id(registration.getId())
                .leagueId(registration.getLeague().getId())
                .leagueName(registration.getLeague().getName())
                .teamId(registration.getTeam().getId())
                .teamName(registration.getTeam().getName())
                .captainId(registration.getCaptain().getId())
                .captainName(registration.getCaptain().getUsername())
                .status(registration.getStatus())
                .createdAt(registration.getCreatedAt())
                .build();
    }
}
