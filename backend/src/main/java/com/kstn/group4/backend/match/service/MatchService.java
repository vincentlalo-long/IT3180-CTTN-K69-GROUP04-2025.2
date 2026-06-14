package com.kstn.group4.backend.match.service;

import com.kstn.group4.backend.booking.entity.Booking;
import com.kstn.group4.backend.booking.entity.BookingStatus;
import com.kstn.group4.backend.booking.repository.BookingRepository;
import com.kstn.group4.backend.booking.service.BookingService;
import com.kstn.group4.backend.config.security.services.UserPrincipal;
import com.kstn.group4.backend.exception.BusinessException;
import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.match.dto.CreateMatchRequest;
import com.kstn.group4.backend.match.dto.MatchRequestResponse;
import com.kstn.group4.backend.match.dto.MatchResponse;
import com.kstn.group4.backend.match.entity.Match;
import com.kstn.group4.backend.match.entity.MatchRequest;
import com.kstn.group4.backend.match.enums.MatchRequestStatus;
import com.kstn.group4.backend.match.enums.MatchSkillLevel;
import com.kstn.group4.backend.match.enums.MatchStatus;
import com.kstn.group4.backend.match.repository.MatchRepository;
import com.kstn.group4.backend.match.repository.MatchRequestRepository;
import com.kstn.group4.backend.team.entity.Team;
import com.kstn.group4.backend.team.enums.TeamStatus;
import com.kstn.group4.backend.team.repository.TeamRepository;
import com.kstn.group4.backend.user.entity.User;
import com.kstn.group4.backend.user.repository.UserRepository;
import com.kstn.group4.backend.venue.entity.Pitch;
import com.kstn.group4.backend.venue.entity.PitchType;
import com.kstn.group4.backend.venue.entity.TimeSlot;
import com.kstn.group4.backend.venue.entity.Venue;
import com.kstn.group4.backend.venue.repository.PitchRepository;
import com.kstn.group4.backend.venue.repository.TimeSlotRepository;
import com.kstn.group4.backend.venue.repository.VenueRepository;
import com.kstn.group4.backend.activitylog.service.ActivityLogService;
import com.kstn.group4.backend.match.dto.MatchResultSubmitRequest;
import com.kstn.group4.backend.match.dto.PlayerStatDto;
import com.kstn.group4.backend.match.event.MatchResultSubmittedEvent;
import com.kstn.group4.backend.notification.event.MatchScheduleChangedEvent;
import com.kstn.group4.backend.statistics.entity.PlayerMatchStatistic;
import com.kstn.group4.backend.statistics.repository.PlayerMatchStatisticRepository;
import org.springframework.context.ApplicationEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final MatchRepository matchRepository;
    private final TeamRepository teamRepository;
    private final VenueRepository venueRepository;
    private final UserRepository userRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final MatchRequestRepository matchRequestRepository;
    private final PitchRepository pitchRepository;
    private final BookingRepository bookingRepository;
    private final BookingService bookingService;
    private final ActivityLogService activityLogService;
    private final PlayerMatchStatisticRepository playerMatchStatisticRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public MatchResponse submitMatchResult(Integer matchId, MatchResultSubmitRequest request) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trận đấu", "Match"));

        if (match.getStatus() == MatchStatus.CANCELLED || match.getStatus() == MatchStatus.OPEN) {
            throw new BusinessException("Trận đấu ở trạng thái " + match.getStatus() + " không thể nộp kết quả");
        }

        match.setHomeScore(request.getHomeScore());
        match.setAwayScore(request.getAwayScore());
        match.setStatus(MatchStatus.COMPLETED);
        matchRepository.save(match);

        // Save player statistics
        if (request.getPlayerStats() != null && !request.getPlayerStats().isEmpty()) {
            List<PlayerMatchStatistic> statistics = new ArrayList<>();
            for (PlayerStatDto statDto : request.getPlayerStats()) {
                PlayerMatchStatistic stat = new PlayerMatchStatistic();
                stat.setMatch(match);
                stat.setPlayer(userRepository.findById(statDto.getPlayerId())
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cầu thủ ID: " + statDto.getPlayerId(), "User")));
                stat.setTeam(teamRepository.findById(statDto.getTeamId())
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đội bóng ID: " + statDto.getTeamId(), "Team")));
                stat.setGoals(statDto.getGoals());
                stat.setAssists(statDto.getAssists());
                statistics.add(stat);
            }
            playerMatchStatisticRepository.saveAll(statistics);
        }

        // Publish Event
        Integer leagueId = match.getLeague() != null ? match.getLeague().getId() : null;
        eventPublisher.publishEvent(new MatchResultSubmittedEvent(
                match.getId(),
                leagueId,
                match.getHostTeam().getId(),
                match.getGuestTeam() != null ? match.getGuestTeam().getId() : null,
                match.getHomeScore(),
                match.getAwayScore()
        ));

        // Log activity
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        Integer adminId = null;
        String adminName = "System";
        if (auth != null && auth.getPrincipal() instanceof com.kstn.group4.backend.config.security.services.UserPrincipal principal) {
            adminId = principal.getId();
            adminName = principal.getAppUsername();
        }
        activityLogService.log(adminId, adminName, "SUBMIT_MATCH_RESULT", "MATCH", match.getId().toString(), 
                "Nộp kết quả trận đấu: " + request.getHomeScore() + " - " + request.getAwayScore(), null, null);

        return mapToResponse(match);
    }

    @Transactional
    public MatchResponse createMatch(UserPrincipal userPrincipal, CreateMatchRequest request) {
        Team hostTeam = teamRepository.findByCaptainId(userPrincipal.getId())
                .orElseThrow(() -> new BusinessException("Chỉ đội trưởng mới được phép tạo kèo"));

        if (hostTeam.getStatus() != TeamStatus.APPROVED) {
            throw new BusinessException("Chỉ đội trưởng của đội bóng đã được duyệt mới có thể tạo kèo");
        }

        TimeSlot timeSlot = timeSlotRepository.findById(request.getTimeSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khung giờ", "TimeSlot"));

        LocalDateTime matchTime = LocalDateTime.of(request.getMatchDate(), timeSlot.getStartTime());

        if (matchTime.isBefore(LocalDateTime.now().plusHours(12))) {
            throw new BusinessException("Thời gian thi đấu phải sau thời điểm hiện tại ít nhất 12 tiếng");
        }

        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khu sân với ID: " + request.getVenueId(), "Venue"));

        PitchType pitchTypeEnum = switch (request.getPitchType()) {
            case 5 -> PitchType.SAN_5;
            case 7 -> PitchType.SAN_7;
            case 11 -> PitchType.SAN_11;
            default -> throw new BusinessException("Loại sân không hợp lệ");
        };

        if (!pitchRepository.existsByVenueIdAndPitchTypeAndIsActiveTrue(request.getVenueId(), pitchTypeEnum)) {
            throw new BusinessException("Cụm sân này không có loại sân bạn yêu cầu hoặc sân đang bảo trì");
        }

        List<Pitch> availablePitches = pitchRepository.findAvailablePitches(
                request.getVenueId(),
                pitchTypeEnum,
                request.getMatchDate(),
                request.getTimeSlotId()
        );
        if (availablePitches.isEmpty()) {
            throw new BusinessException("Loại sân này đã được đặt hết trong khung giờ đã chọn");
        }

        Match match = new Match();
        match.setVenue(venue);
        match.setHostTeam(hostTeam);
        match.setTimeSlot(timeSlot);
        match.setPitchType(request.getPitchType());
        match.setSkillLevel(request.getSkillLevel());
        match.setMatchTime(matchTime);
        match.setDescription(request.getDescription());
        match.setStatus(MatchStatus.OPEN);

        match = matchRepository.save(match);
        return mapToResponse(match);
    }

    @Transactional(readOnly = true)
    public List<MatchResponse> getOpenMatches(Integer venueId, MatchSkillLevel skillLevel) {
        return getOpenMatches(null, venueId, skillLevel);
    }

    @Transactional(readOnly = true)
    public List<MatchResponse> getOpenMatches(UserPrincipal userPrincipal, Integer venueId, MatchSkillLevel skillLevel) {
        List<Match> matches = matchRepository.findOpenMatches(venueId, skillLevel);

        if (userPrincipal == null) {
            return matches.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        User user = userRepository.findById(userPrincipal.getId()).orElse(null);
        if (user == null || user.getTeamId() == null) {
            return matches.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        Long teamId = user.getTeamId();
        Team userTeam = teamRepository.findById(teamId).orElse(null);
        String teamName = userTeam != null ? userTeam.getName() : "";
        String teamDesc = userTeam != null ? userTeam.getDescription() : "";

        List<Match> history = matchRepository.findByHostOrGuestTeamId(teamId);

        Double avgSkillLevel = null;
        Double avgSlotNumber = null;
        Map<Integer, Long> venueFrequencies = new HashMap<>();
        Long maxVenueCount = 0L;
        Integer favoriteVenueId = null;
        Venue favoriteVenue = null;

        int totalMatches = history.size();
        if (totalMatches > 0) {
            double skillSum = 0;
            double slotSum = 0;
            int slotCount = 0;

            for (Match m : history) {
                // Skill Level
                double skillVal = 2.0;
                if (m.getSkillLevel() != null) {
                    skillVal = switch (m.getSkillLevel()) {
                        case WEAK -> 1.0;
                        case AVERAGE -> 2.0;
                        case GOOD -> 3.0;
                    };
                }
                skillSum += skillVal;

                // Time Slot
                if (m.getTimeSlot() != null && m.getTimeSlot().getSlotNumber() != null) {
                    slotSum += m.getTimeSlot().getSlotNumber();
                    slotCount++;
                }

                // Venue
                if (m.getVenue() != null) {
                    Integer vId = m.getVenue().getId();
                    venueFrequencies.put(vId, venueFrequencies.getOrDefault(vId, 0L) + 1);
                }
            }

            avgSkillLevel = skillSum / totalMatches;
            if (slotCount > 0) {
                avgSlotNumber = slotSum / slotCount;
            } else {
                avgSlotNumber = 6.0;
            }

            for (Map.Entry<Integer, Long> entry : venueFrequencies.entrySet()) {
                if (entry.getValue() > maxVenueCount) {
                    maxVenueCount = entry.getValue();
                    favoriteVenueId = entry.getKey();
                }
            }

            if (favoriteVenueId != null) {
                for (Match m : history) {
                    if (m.getVenue() != null && favoriteVenueId.equals(m.getVenue().getId())) {
                        favoriteVenue = m.getVenue();
                        break;
                    }
                }
            }
        }

        final Double finalAvgSkillLevel = (avgSkillLevel != null) ? avgSkillLevel : getDefaultSkillLevel(teamName, teamDesc);
        final Double finalAvgSlotNumber = (avgSlotNumber != null) ? avgSlotNumber : getDefaultSlotNumber(teamName, teamDesc);
        final Long finalMaxVenueCount = maxVenueCount;
        final Venue finalFavoriteVenue = favoriteVenue;
        final Long finalTeamId = teamId;

        return matches.stream()
                .sorted((m1, m2) -> {
                    double score1 = computeSimilarityScore(m1, totalMatches, venueFrequencies, finalMaxVenueCount, finalFavoriteVenue, finalAvgSkillLevel, finalAvgSlotNumber, teamName, teamDesc);
                    double score2 = computeSimilarityScore(m2, totalMatches, venueFrequencies, finalMaxVenueCount, finalFavoriteVenue, finalAvgSkillLevel, finalAvgSlotNumber, teamName, teamDesc);
                    
                    if (Math.abs(score1 - score2) < 1e-5) {
                        if (m1.getMatchTime() != null && m2.getMatchTime() != null) {
                            return m1.getMatchTime().compareTo(m2.getMatchTime());
                        }
                        return 0;
                    }
                    return Double.compare(score2, score1); // Descending score
                })
                .map(m -> {
                    MatchResponse resp = this.mapToResponse(m);
                    double score = computeSimilarityScore(m, totalMatches, venueFrequencies, finalMaxVenueCount, finalFavoriteVenue, finalAvgSkillLevel, finalAvgSlotNumber, teamName, teamDesc);
                    if (score >= 0.65 && !m.getHostTeam().getId().equals(finalTeamId)) {
                        resp.setRecommended(true);
                    }
                    return resp;
                })
                .collect(Collectors.toList());
    }

    private double computeSimilarityScore(Match m, int totalMatches, Map<Integer, Long> venueFrequencies, 
                                          Long maxVenueCount, Venue favoriteVenue, Double avgSkillLevel, 
                                          Double avgSlotNumber, String teamName, String teamDesc) {
        // 1. Area Similarity
        double areaScore = 0.0;
        if (m.getVenue() != null) {
            Integer vId = m.getVenue().getId();
            if (totalMatches > 0) {
                if (venueFrequencies.containsKey(vId)) {
                    double freq = venueFrequencies.get(vId);
                    areaScore = 0.5 + 0.5 * (freq / maxVenueCount);
                } else if (favoriteVenue != null && favoriteVenue.getLatitude() != null && favoriteVenue.getLongitude() != null
                        && m.getVenue().getLatitude() != null && m.getVenue().getLongitude() != null) {
                    double dist = calculateDistance(
                            favoriteVenue.getLatitude(), favoriteVenue.getLongitude(),
                            m.getVenue().getLatitude(), m.getVenue().getLongitude()
                    );
                    areaScore = Math.exp(-0.1 * dist);
                } else {
                    String favVenueInfo = favoriteVenue != null ? (favoriteVenue.getName() + " " + favoriteVenue.getAddress()) : "";
                    String candidateVenueInfo = m.getVenue().getName() + " " + (m.getVenue().getAddress() != null ? m.getVenue().getAddress() : "");
                    if (hasKeywordOverlap(favVenueInfo, candidateVenueInfo) || hasKeywordOverlap(teamDesc, candidateVenueInfo)) {
                        areaScore = 0.4;
                    }
                }
            } else {
                String candidateVenueInfo = m.getVenue().getName() + " " + (m.getVenue().getAddress() != null ? m.getVenue().getAddress() : "");
                if (hasKeywordOverlap(teamName + " " + teamDesc, candidateVenueInfo)) {
                    areaScore = 0.8;
                }
            }
        }

        // 2. Skill Level Similarity
        double skillScore = 1.0;
        if (m.getSkillLevel() != null) {
            double candSkillVal = switch (m.getSkillLevel()) {
                case WEAK -> 1.0;
                case AVERAGE -> 2.0;
                case GOOD -> 3.0;
            };
            skillScore = 1.0 - (Math.abs(candSkillVal - avgSkillLevel) / 2.0);
        }

        // 3. Time Slot Similarity
        double timeScore = 1.0;
        if (m.getTimeSlot() != null && m.getTimeSlot().getSlotNumber() != null) {
            double candSlotVal = m.getTimeSlot().getSlotNumber();
            timeScore = 1.0 - (Math.abs(candSlotVal - avgSlotNumber) / 10.0);
        }

        return 0.40 * areaScore + 0.35 * skillScore + 0.25 * timeScore;
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double earthRadius = 6371.0; // in kilometers
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadius * c;
    }

    private boolean hasKeywordOverlap(String text1, String text2) {
        if (text1 == null || text2 == null) return false;
        String t1 = text1.toLowerCase();
        String t2 = text2.toLowerCase();
        String[] keywords = {
            "cầu giấy", "đống đa", "thanh xuân", "hai bà trưng", "hoàn kiếm", 
            "ba đình", "tây hồ", "long biên", "hoàng mai", "hà đông", 
            "nam từ liêm", "bắc từ liêm", "yên hòa", "dịch vọng"
        };
        for (String keyword : keywords) {
            if (t1.contains(keyword) && t2.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private double getDefaultSkillLevel(String teamName, String teamDesc) {
        String combined = (teamName + " " + (teamDesc != null ? teamDesc : "")).toLowerCase();
        if (combined.contains("yếu") || combined.contains("mới chơi") || combined.contains("weak") || combined.contains("sơ cấp")) {
            return 1.0;
        }
        if (combined.contains("mạnh") || combined.contains("cứng") || combined.contains("pro") || combined.contains("khá") || combined.contains("giỏi") || combined.contains("good")) {
            return 3.0;
        }
        return 2.0;
    }

    private double getDefaultSlotNumber(String teamName, String teamDesc) {
        String combined = (teamName + " " + (teamDesc != null ? teamDesc : "")).toLowerCase();
        if (combined.contains("sáng") || combined.contains("morning")) {
            return 2.0;
        }
        if (combined.contains("tối") || combined.contains("đêm") || combined.contains("evening") || combined.contains("night")) {
            return 9.5;
        }
        if (combined.contains("chiều") || combined.contains("afternoon")) {
            return 5.5;
        }
        return 6.0;
    }

    @Transactional
    public MatchResponse joinMatch(UserPrincipal userPrincipal, Integer matchId) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng", "User"));

        if (user.getTeamId() == null) {
            throw new BusinessException("Bạn chưa có đội bóng");
        }

        Team guestTeam = teamRepository.findById(user.getTeamId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đội bóng", "Team"));

        if (guestTeam.getStatus() != TeamStatus.APPROVED) {
            throw new BusinessException("Chỉ đội bóng đã được duyệt mới có thể nhận kèo");
        }

        // Lock Match row to prevent race conditions
        Match match = matchRepository.findByIdForUpdate(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy kèo đấu với ID: " + matchId, "Match"));

        if (match.getStatus() != MatchStatus.OPEN) {
            throw new BusinessException("Kèo đấu không còn ở trạng thái OPEN hoặc đã được nhận bởi đội khác");
        }

        if (match.getHostTeam().getId().equals(guestTeam.getId())) {
            throw new BusinessException("Bạn không thể tự nhận kèo của chính đội mình");
        }

        boolean isCaptain = guestTeam.getCaptain().getId().equals(user.getId());
        MatchRequestStatus status = isCaptain ? MatchRequestStatus.PENDING_HOST_CAPTAIN : MatchRequestStatus.PENDING_GUEST_CAPTAIN;

        MatchRequest matchRequest = new MatchRequest();
        matchRequest.setMatch(match);
        matchRequest.setGuestTeam(guestTeam);
        matchRequest.setCreatedByUser(user);
        matchRequest.setStatus(status);
        matchRequestRepository.save(matchRequest);

        return mapToResponse(match);
    }

    @Transactional
    public MatchResponse approveMatchRequest(UserPrincipal userPrincipal, Integer requestId) {
        MatchRequest matchRequest = matchRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy yêu cầu bắt đối với ID: " + requestId, "MatchRequest"));

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng", "User"));

        Booking booking = null;

        if (matchRequest.getStatus() == MatchRequestStatus.PENDING_GUEST_CAPTAIN) {
            // Must be Guest Team Captain
            if (!matchRequest.getGuestTeam().getCaptain().getId().equals(user.getId())) {
                throw new BusinessException("Chỉ đội trưởng đội khách mới được phê duyệt yêu cầu này");
            }
            matchRequest.setStatus(MatchRequestStatus.PENDING_HOST_CAPTAIN);
            matchRequestRepository.save(matchRequest);
        } else if (matchRequest.getStatus() == MatchRequestStatus.PENDING_HOST_CAPTAIN) {
            // Must be Host Team Captain
            Match match = matchRepository.findByIdForUpdate(matchRequest.getMatch().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trận đấu liên quan", "Match"));

            if (match.getStatus() != MatchStatus.OPEN) {
                throw new BusinessException("Trận đấu này không còn ở trạng thái OPEN");
            }

            if (!match.getHostTeam().getCaptain().getId().equals(user.getId())) {
                throw new BusinessException("Chỉ đội trưởng đội chủ nhà mới được phê duyệt yêu cầu này");
            }

            // === AUTO-BOOKING: Find available pitch and create booking ===
            PitchType pitchTypeEnum = mapIntToPitchType(match.getPitchType());
            List<Pitch> availablePitches = pitchRepository.findAvailablePitches(
                    match.getVenue().getId(),
                    pitchTypeEnum,
                    match.getMatchTime().toLocalDate(),
                    match.getTimeSlot().getId()
            );

            if (availablePitches.isEmpty()) {
                // No pitch available — cancel match
                match.setStatus(MatchStatus.CANCELLED);
                matchRepository.save(match);
                matchRequest.setStatus(MatchRequestStatus.REJECTED);
                matchRequestRepository.save(matchRequest);
                throw new BusinessException("Khu sân đã hết sân loại " + match.getPitchType()
                        + " người trong khung giờ bạn chọn. Kèo đã bị hủy tự động.");
            }

            Pitch selectedPitch = availablePitches.get(0);

            // Create auto-booking with CONFIRMED status and calculated price
            booking = bookingService.createMatchAutoBooking(
                    match.getHostTeam().getCaptain().getId(),
                    selectedPitch.getId(),
                    match.getTimeSlot().getId(),
                    match.getMatchTime().toLocalDate()
            );

            // Update match state
            match.setGuestTeam(matchRequest.getGuestTeam());
            match.setStatus(MatchStatus.SCHEDULED);
            matchRepository.save(match);
            publishMatchScheduleChanged(match, "SCHEDULED");

            matchRequest.setStatus(MatchRequestStatus.APPROVED);
            matchRequestRepository.save(matchRequest);

            // Automatically reject all other requests for this match
            List<MatchRequest> otherRequests = matchRequestRepository.findByMatchId(match.getId());
            for (MatchRequest other : otherRequests) {
                if (!other.getId().equals(matchRequest.getId()) &&
                    (other.getStatus() == MatchRequestStatus.PENDING_GUEST_CAPTAIN ||
                     other.getStatus() == MatchRequestStatus.PENDING_HOST_CAPTAIN)) {
                    other.setStatus(MatchRequestStatus.REJECTED);
                    matchRequestRepository.save(other);
                }
            }
        } else {
            throw new BusinessException("Yêu cầu này đã được xử lý (APPROVED hoặc REJECTED)");
        }

        MatchResponse response = mapToResponse(matchRequest.getMatch());
        if (booking != null) {
            response.setBookingId(booking.getId());
            response.setPrice(booking.getTotalPrice());
        }
        return response;
    }

    @Transactional(readOnly = true)
    public List<MatchRequestResponse> getMatchRequests(Integer matchId) {
        List<MatchRequest> requests = matchRequestRepository.findByMatchId(matchId);
        return requests.stream()
                .map(r -> new MatchRequestResponse(
                        r.getId(),
                        r.getMatch().getId(),
                        r.getGuestTeam().getId(),
                        r.getGuestTeam().getName(),
                        r.getCreatedByUser().getUsername(),
                        r.getStatus(),
                        r.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MatchResponse> getAllMatchesForAdmin(Integer venueId) {
        List<Match> matches;
        if (venueId != null) {
            matches = matchRepository.findByVenueId(venueId);
        } else {
            matches = matchRepository.findAll();
        }
        return matches.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public void deleteMatch(Integer id) {
        if (!matchRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy trận đấu với ID: " + id, "Match");
        }
        Match match = matchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found", "Match"));
        publishMatchScheduleChanged(match, "CANCELLED");
        matchRepository.delete(match);

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        Integer adminId = null;
        String adminName = "System";
        if (auth != null && auth.getPrincipal() instanceof com.kstn.group4.backend.config.security.services.UserPrincipal principal) {
            adminId = principal.getId();
            adminName = principal.getAppUsername();
        }
        activityLogService.log(adminId, adminName, "CANCEL_MATCH", "MATCH", id.toString(), "Hủy/Xóa trận đấu cáp kèo", null, null);
    }

    private MatchResponse mapToResponse(Match match) {
        return new MatchResponse(
                match.getId(),
                match.getVenue().getId(),
                match.getVenue().getName(),
                match.getHostTeam().getId(),
                match.getHostTeam().getName(),
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

    private PitchType mapIntToPitchType(Integer pitchType) {
        if (pitchType == null) {
            return PitchType.SAN_5; // Default fallback
        }
        return switch (pitchType) {
            case 7 -> PitchType.SAN_7;
            case 11 -> PitchType.SAN_11;
            default -> PitchType.SAN_5;
        };
    }

    private void publishMatchScheduleChanged(Match match, String changeType) {
        List<Long> teamIds = new ArrayList<>();
        if (match.getHostTeam() != null) {
            teamIds.add(match.getHostTeam().getId());
        }
        if (match.getGuestTeam() != null) {
            teamIds.add(match.getGuestTeam().getId());
        }

        if (teamIds.isEmpty()) {
            return;
        }

        eventPublisher.publishEvent(new MatchScheduleChangedEvent(
                match.getId(),
                teamIds,
                changeType,
                match.getVenue() != null ? match.getVenue().getName() : "N/A",
                match.getMatchTime()
        ));
    }
}
