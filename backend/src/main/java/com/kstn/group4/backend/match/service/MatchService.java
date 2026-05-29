package com.kstn.group4.backend.match.service;

import com.kstn.group4.backend.config.security.services.UserPrincipal;
import com.kstn.group4.backend.exception.BusinessException;
import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.match.dto.CreateMatchRequest;
import com.kstn.group4.backend.match.dto.MatchResponse;
import com.kstn.group4.backend.match.entity.Match;
import com.kstn.group4.backend.match.enums.MatchSkillLevel;
import com.kstn.group4.backend.match.enums.MatchStatus;
import com.kstn.group4.backend.match.repository.MatchRepository;
import com.kstn.group4.backend.team.entity.Team;
import com.kstn.group4.backend.team.enums.TeamStatus;
import com.kstn.group4.backend.team.repository.TeamRepository;
import com.kstn.group4.backend.venue.entity.Venue;
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

    @Transactional
    public MatchResponse createMatch(UserPrincipal userPrincipal, CreateMatchRequest request) {
        Team hostTeam = teamRepository.findByCaptainId(userPrincipal.getId())
                .orElseThrow(() -> new BusinessException("Bạn chưa có đội bóng hoặc không phải đội trưởng"));

        if (hostTeam.getStatus() != TeamStatus.APPROVED) {
            throw new BusinessException("Chỉ đội trưởng của đội bóng đã được duyệt mới có thể tạo kèo");
        }

        if (request.getMatchTime().isBefore(LocalDateTime.now().plusHours(12))) {
            throw new BusinessException("Thời gian thi đấu phải sau thời điểm hiện tại ít nhất 12 tiếng");
        }

        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khu sân với ID: " + request.getVenueId(), "Venue"));

        Match match = new Match();
        match.setVenue(venue);
        match.setHostTeam(hostTeam);
        match.setSkillLevel(request.getSkillLevel());
        match.setMatchTime(request.getMatchTime());
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
        Team guestTeam = teamRepository.findByCaptainId(userPrincipal.getId())
                .orElseThrow(() -> new BusinessException("Bạn chưa có đội bóng hoặc không phải đội trưởng"));

        if (guestTeam.getStatus() != TeamStatus.APPROVED) {
            throw new BusinessException("Chỉ đội trưởng của đội bóng đã được duyệt mới có thể nhận kèo");
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

        match.setGuestTeam(guestTeam);
        match.setStatus(MatchStatus.MATCHED);

        match = matchRepository.save(match);
        return mapToResponse(match);
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
                match.getStatus()
        );
    }
}
