package com.kstn.group4.backend.league.service;

import com.kstn.group4.backend.exception.BusinessException;
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
import com.kstn.group4.backend.league.entity.LeagueRegistration;
import com.kstn.group4.backend.league.enums.RegistrationStatus;
import com.kstn.group4.backend.league.repository.LeagueRegistrationRepository;
import com.kstn.group4.backend.venue.entity.Venue;
import com.kstn.group4.backend.venue.repository.VenueRepository;
import com.kstn.group4.backend.venue.entity.TimeSlot;
import com.kstn.group4.backend.venue.repository.TimeSlotRepository;
import com.kstn.group4.backend.team.entity.Team;
import com.kstn.group4.backend.match.entity.Match;
import com.kstn.group4.backend.match.repository.MatchRepository;
import com.kstn.group4.backend.match.enums.MatchSkillLevel;
import com.kstn.group4.backend.match.enums.MatchStatus;
import com.kstn.group4.backend.league.enums.LeagueFormat;
import com.kstn.group4.backend.league.enums.LeagueStatus;
import com.kstn.group4.backend.league.dto.MatchPairingDto;
import com.kstn.group4.backend.match.dto.MatchResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class LeagueServiceImpl implements LeagueService {

    private final LeagueRepository leagueRepository;
    private final UserRepository userRepository;
    private final LeagueStandingRepository leagueStandingRepository;
    private final PlayerMatchStatisticRepository playerMatchStatisticRepository;
    private final LeagueRegistrationRepository leagueRegistrationRepository;
    private final MatchRepository matchRepository;
    private final VenueRepository venueRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final ScheduleGeneratorService scheduleGeneratorService;

    public LeagueServiceImpl(LeagueRepository leagueRepository, 
                             UserRepository userRepository,
                             LeagueStandingRepository leagueStandingRepository,
                             PlayerMatchStatisticRepository playerMatchStatisticRepository,
                             LeagueRegistrationRepository leagueRegistrationRepository,
                             MatchRepository matchRepository,
                             VenueRepository venueRepository,
                             TimeSlotRepository timeSlotRepository,
                             ScheduleGeneratorService scheduleGeneratorService) {
        this.leagueRepository = leagueRepository;
        this.userRepository = userRepository;
        this.leagueStandingRepository = leagueStandingRepository;
        this.playerMatchStatisticRepository = playerMatchStatisticRepository;
        this.leagueRegistrationRepository = leagueRegistrationRepository;
        this.matchRepository = matchRepository;
        this.venueRepository = venueRepository;
        this.timeSlotRepository = timeSlotRepository;
        this.scheduleGeneratorService = scheduleGeneratorService;
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

    @Override
    @Transactional
    public List<MatchResponse> generateSchedule(Integer leagueId, Integer managerId) {
        League league = leagueRepository.findById(leagueId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giải đấu"));

        if (!league.getManager().getId().equals(managerId)) {
            throw new ForbiddenException("Bạn không có quyền xếp lịch thi đấu cho giải đấu này");
        }

        // Check if schedule is already generated (matches exist for this league)
        List<Match> existingMatches = matchRepository.findByLeagueId(leagueId);
        if (!existingMatches.isEmpty()) {
            throw new BusinessException("Giải đấu đã được xếp lịch thi đấu trước đó");
        }

        // 1. Fetch approved registrations
        List<LeagueRegistration> registrations = leagueRegistrationRepository.findByLeagueId(leagueId);
        List<Team> approvedTeams = registrations.stream()
                .filter(r -> r.getStatus() == RegistrationStatus.APPROVED)
                .map(LeagueRegistration::getTeam)
                .collect(Collectors.toList());

        if (approvedTeams.size() < 2) {
            throw new BusinessException("Giải đấu phải có ít nhất 2 đội được duyệt tham gia để xếp lịch");
        }

        List<Integer> teamIds = approvedTeams.stream()
                .map(t -> t.getId().intValue())
                .collect(Collectors.toList());

        // 2. Call appropriate schedule generation logic
        List<MatchPairingDto> pairings;
        if (league.getFormat() == LeagueFormat.ROUND_ROBIN) {
            pairings = scheduleGeneratorService.generateRoundRobin(teamIds);
        } else if (league.getFormat() == LeagueFormat.KNOCKOUT) {
            pairings = scheduleGeneratorService.generateKnockout(teamIds);
        } else {
            throw new BusinessException("Hệ thống chưa hỗ trợ thể thức thi đấu " + league.getFormat());
        }

        // 3. Load default Venue and TimeSlot
        Venue defaultVenue = venueRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new BusinessException("Vui lòng tạo ít nhất một sân đấu (Venue) trước khi xếp lịch thi đấu"));
        TimeSlot defaultTimeSlot = timeSlotRepository.findAll().stream().findFirst().orElse(null);

        // Map pairings to Match entities
        List<Match> matches = new ArrayList<>();
        LocalDateTime baseTime = LocalDateTime.now().plusDays(1).withHour(18).withMinute(0).withSecond(0).withNano(0);

        // First, create the Match entities and set their fields (except nextMatchId references)
        // We will store them in a map by their pairing matchId to resolve nextMatchId later
        Map<Integer, Match> pairingIdToMatchMap = new HashMap<>();

        for (MatchPairingDto pairing : pairings) {
            Match match = new Match();
            match.setLeague(league);
            match.setVenue(defaultVenue);
            match.setTimeSlot(defaultTimeSlot);
            match.setSkillLevel(MatchSkillLevel.AVERAGE);
            match.setStatus(MatchStatus.SCHEDULED);
            match.setRoundNumber(pairing.getRoundNumber());
            match.setMatchTime(baseTime.plusDays(pairing.getRoundNumber() - 1));

            // Set teams
            Integer homeId = pairing.getHomeTeamId();
            Integer awayId = pairing.getAwayTeamId();

            // Handle host & guest assignment
            if (homeId != null) {
                Team host = approvedTeams.stream()
                        .filter(t -> t.getId().equals(homeId.longValue()))
                        .findFirst()
                        .orElse(null);
                match.setHostTeam(host);
            }
            if (awayId != null) {
                Team guest = approvedTeams.stream()
                        .filter(t -> t.getId().equals(awayId.longValue()))
                        .findFirst()
                        .orElse(null);
                match.setGuestTeam(guest);
            }

            // In case host is null but guest is not (swap for BYE representation)
            if (match.getHostTeam() == null && match.getGuestTeam() != null) {
                match.setHostTeam(match.getGuestTeam());
                match.setGuestTeam(null);
            }

            matches.add(match);
            pairingIdToMatchMap.put(pairing.getMatchId(), match);
        }

        // Save matches first to generate database IDs
        matchRepository.saveAll(matches);

        // Now update nextMatchId references using the generated DB IDs
        for (MatchPairingDto pairing : pairings) {
            if (pairing.getNextMatchId() != null) {
                Match currentMatch = pairingIdToMatchMap.get(pairing.getMatchId());
                Match nextMatch = pairingIdToMatchMap.get(pairing.getNextMatchId());
                if (currentMatch != null && nextMatch != null) {
                    currentMatch.setNextMatchId(nextMatch.getId());
                }
            }
        }

        // Save matches again to persist nextMatchId
        matchRepository.saveAll(matches);

        // 4. Update league status to IN_PROGRESS
        league.setStatus(LeagueStatus.IN_PROGRESS);
        leagueRepository.save(league);

        return matches.stream()
                .map(this::mapToMatchResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MatchResponse> getLeagueMatches(Integer leagueId) {
        return matchRepository.findByLeagueId(leagueId).stream()
                .map(this::mapToMatchResponse)
                .collect(Collectors.toList());
    }

    private MatchResponse mapToMatchResponse(Match match) {
        return new MatchResponse(
                match.getId(),
                match.getVenue() != null ? match.getVenue().getId() : null,
                match.getVenue() != null ? match.getVenue().getName() : null,
                match.getHostTeam() != null ? match.getHostTeam().getId() : null,
                match.getHostTeam() != null ? match.getHostTeam().getName() : null,
                match.getGuestTeam() != null ? match.getGuestTeam().getId() : null,
                match.getGuestTeam() != null ? match.getGuestTeam().getName() : null,
                match.getSkillLevel(),
                match.getMatchTime(),
                match.getStatus(),
                match.getDescription(),
                match.getPitchType(),
                match.getHomeScore(),
                match.getAwayScore(),
                match.getRoundNumber(),
                match.getNextMatchId(),
                false
        );
    }
}
