package com.kstn.group4.backend.match.service;

import com.kstn.group4.backend.config.security.services.UserPrincipal;
import com.kstn.group4.backend.exception.BusinessException;
import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.match.dto.CreateMatchRequest;
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
import com.kstn.group4.backend.venue.entity.TimeSlot;
import com.kstn.group4.backend.venue.entity.Venue;
import com.kstn.group4.backend.venue.repository.TimeSlotRepository;
import com.kstn.group4.backend.venue.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
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

        Match match = new Match();
        match.setVenue(venue);
        match.setHostTeam(hostTeam);
        match.setSkillLevel(request.getSkillLevel());
        match.setMatchTime(matchTime);
        match.setDescription(request.getDescription());
        match.setStatus(MatchStatus.OPEN);

        match = matchRepository.save(match);
        return mapToResponse(match);
    }

    @Transactional(readOnly = true)
    public List<MatchResponse> getOpenMatches(Integer venueId, MatchSkillLevel skillLevel) {
        return matchRepository.findOpenMatches(venueId, skillLevel).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
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

            match.setGuestTeam(matchRequest.getGuestTeam());
            match.setStatus(MatchStatus.MATCHED);
            matchRepository.save(match);

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

        return mapToResponse(matchRequest.getMatch());
    }

    @Transactional(readOnly = true)
    public List<MatchResponse> getAllMatchesForAdmin() {
        return matchRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteMatch(Integer id) {
        if (!matchRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy trận đấu với ID: " + id, "Match");
        }
        matchRepository.deleteById(id);
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
                match.getDescription()
        );
    }
}
