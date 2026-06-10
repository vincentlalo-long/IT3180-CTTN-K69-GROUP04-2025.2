package com.kstn.group4.backend.league.service;

import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.exception.ForbiddenException;
import com.kstn.group4.backend.league.dto.LeagueRequest;
import com.kstn.group4.backend.league.dto.LeagueResponse;
import com.kstn.group4.backend.league.entity.League;
import com.kstn.group4.backend.league.repository.LeagueRepository;
import com.kstn.group4.backend.league.dto.LeagueStandingResponse;
import com.kstn.group4.backend.league.repository.LeagueStandingRepository;
import com.kstn.group4.backend.statistics.dto.TopPlayerStatDto;
import com.kstn.group4.backend.statistics.repository.PlayerMatchStatisticRepository;
import com.kstn.group4.backend.user.entity.User;
import com.kstn.group4.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeagueServiceImpl implements LeagueService {

    private final LeagueRepository leagueRepository;
    private final UserRepository userRepository;
    private final LeagueStandingRepository leagueStandingRepository;
    private final PlayerMatchStatisticRepository playerMatchStatisticRepository;

    public LeagueServiceImpl(LeagueRepository leagueRepository, 
                             UserRepository userRepository,
                             LeagueStandingRepository leagueStandingRepository,
                             PlayerMatchStatisticRepository playerMatchStatisticRepository) {
        this.leagueRepository = leagueRepository;
        this.userRepository = userRepository;
        this.leagueStandingRepository = leagueStandingRepository;
        this.playerMatchStatisticRepository = playerMatchStatisticRepository;
    }

    @Override
    public List<LeagueStandingResponse> getLeagueStandings(Integer leagueId) {
        return leagueStandingRepository.findByLeagueIdOrderByPointsDescGoalDifferenceDescGoalsForDesc(leagueId)
                .stream()
                .map(s -> new LeagueStandingResponse(
                        s.getId(),
                        s.getTeam().getId(),
                        s.getTeam().getName(),
                        s.getPlayed(),
                        s.getWon(),
                        s.getDrawn(),
                        s.getLost(),
                        s.getGoalsFor(),
                        s.getGoalsAgainst(),
                        s.getGoalDifference(),
                        s.getPoints()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<TopPlayerStatDto> getTopScorers(Integer leagueId) {
        return playerMatchStatisticRepository.findTopScorersByLeagueId(leagueId);
    }

    @Override
    public List<TopPlayerStatDto> getTopAssists(Integer leagueId) {
        return playerMatchStatisticRepository.findTopAssistsByLeagueId(leagueId);
    }

    @Override
    public List<LeagueResponse> getAllLeagues() {
        return leagueRepository.findAll().stream()
                .map(LeagueResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<LeagueResponse> getLeaguesByManagerId(Integer managerId) {
        return leagueRepository.findByManagerId(managerId).stream()
                .map(LeagueResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public LeagueResponse getLeagueById(Integer id) {
        League league = leagueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giải đấu"));
        return LeagueResponse.fromEntity(league);
    }

    @Override
    @Transactional
    public LeagueResponse createLeague(LeagueRequest request, Integer managerId) {
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        League league = new League();
        league.setName(request.getName());
        league.setFormat(request.getFormat());
        league.setNumberOfTeams(request.getNumberOfTeams());
        league.setPrize(request.getPrize());
        league.setStatus(request.getStatus());
        league.setManager(manager);

        League savedLeague = leagueRepository.save(league);
        return LeagueResponse.fromEntity(savedLeague);
    }

    @Override
    @Transactional
    public LeagueResponse updateLeague(Integer id, LeagueRequest request, Integer managerId) {
        League league = leagueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giải đấu"));

        if (!league.getManager().getId().equals(managerId)) {
            throw new ForbiddenException("Bạn không có quyền cập nhật giải đấu này");
        }

        league.setName(request.getName());
        league.setFormat(request.getFormat());
        league.setNumberOfTeams(request.getNumberOfTeams());
        league.setPrize(request.getPrize());
        league.setStatus(request.getStatus());

        League updatedLeague = leagueRepository.save(league);
        return LeagueResponse.fromEntity(updatedLeague);
    }

    @Override
    @Transactional
    public void deleteLeague(Integer id, Integer managerId) {
        League league = leagueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giải đấu"));

        if (!league.getManager().getId().equals(managerId)) {
            throw new ForbiddenException("Bạn không có quyền xóa giải đấu này");
        }

        leagueRepository.delete(league);
    }
}
