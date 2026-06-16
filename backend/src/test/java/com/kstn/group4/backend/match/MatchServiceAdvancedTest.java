package com.kstn.group4.backend.match;

import com.kstn.group4.backend.activitylog.service.ActivityLogService;
import com.kstn.group4.backend.booking.repository.BookingRepository;
import com.kstn.group4.backend.booking.service.BookingService;
import com.kstn.group4.backend.config.security.services.UserPrincipal;
import com.kstn.group4.backend.exception.BusinessException;
import com.kstn.group4.backend.exception.ForbiddenException;
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
import com.kstn.group4.backend.match.service.MatchService;
import com.kstn.group4.backend.statistics.repository.PlayerMatchStatisticRepository;
import com.kstn.group4.backend.team.entity.Team;
import com.kstn.group4.backend.team.enums.TeamStatus;
import com.kstn.group4.backend.team.repository.TeamRepository;
import com.kstn.group4.backend.user.entity.User;
import com.kstn.group4.backend.user.repository.UserRepository;
import com.kstn.group4.backend.venue.entity.Pitch;
import com.kstn.group4.backend.venue.entity.TimeSlot;
import com.kstn.group4.backend.venue.entity.Venue;
import com.kstn.group4.backend.venue.repository.PitchRepository;
import com.kstn.group4.backend.venue.repository.TimeSlotRepository;
import com.kstn.group4.backend.venue.repository.VenueRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class MatchServiceAdvancedTest {

    @Mock private MatchRepository matchRepository;
    @Mock private TeamRepository teamRepository;
    @Mock private VenueRepository venueRepository;
    @Mock private UserRepository userRepository;
    @Mock private TimeSlotRepository timeSlotRepository;
    @Mock private MatchRequestRepository matchRequestRepository;
    @Mock private PitchRepository pitchRepository;
    @Mock private BookingRepository bookingRepository;
    @Mock private BookingService bookingService;
    @Mock private ActivityLogService activityLogService;
    @Mock private PlayerMatchStatisticRepository playerMatchStatisticRepository;
    @Mock private ApplicationEventPublisher eventPublisher;

    @InjectMocks private MatchService matchService;

    private User hostUser;
    private User guestUser;
    private User thirdUser;
    private UserPrincipal hostPrincipal;
    private UserPrincipal guestPrincipal;
    private UserPrincipal thirdPrincipal;
    private Team hostTeam;
    private Team guestTeam;
    private Team thirdTeam;
    private Venue venue;
    private TimeSlot timeSlot;
    private Match openMatch;
    private Pitch pitch;

    @BeforeEach
    void setUp() {
        hostUser = new User("host", "host@email.com", "pass", "PLAYER");
        hostUser.setId(1);
        hostUser.setTeamId(10L);

        guestUser = new User("guest", "guest@email.com", "pass", "PLAYER");
        guestUser.setId(2);
        guestUser.setTeamId(20L);

        thirdUser = new User("third", "third@email.com", "pass", "PLAYER");
        thirdUser.setId(3);
        thirdUser.setTeamId(30L);

        hostPrincipal = UserPrincipal.build(hostUser);
        guestPrincipal = UserPrincipal.build(guestUser);
        thirdPrincipal = UserPrincipal.build(thirdUser);

        hostTeam = new Team();
        hostTeam.setId(10L);
        hostTeam.setName("Host FC");
        hostTeam.setStatus(TeamStatus.APPROVED);
        hostTeam.setCaptain(hostUser);

        guestTeam = new Team();
        guestTeam.setId(20L);
        guestTeam.setName("Guest FC");
        guestTeam.setStatus(TeamStatus.APPROVED);
        guestTeam.setCaptain(guestUser);

        thirdTeam = new Team();
        thirdTeam.setId(30L);
        thirdTeam.setName("Third FC");
        thirdTeam.setStatus(TeamStatus.APPROVED);
        thirdTeam.setCaptain(thirdUser);

        venue = new Venue();
        venue.setId(5);
        venue.setName("Test Venue");
        venue.setOpenTime(LocalTime.of(6, 0));
        venue.setCloseTime(LocalTime.of(23, 0));

        timeSlot = new TimeSlot();
        timeSlot.setId(6);
        timeSlot.setSlotNumber(6);
        timeSlot.setStartTime(LocalTime.of(15, 30));
        timeSlot.setEndTime(LocalTime.of(17, 0));

        pitch = new Pitch();
        pitch.setId(50);
        pitch.setName("Pitch 5-a-side");
        pitch.setVenue(venue);

        openMatch = new Match();
        openMatch.setId(100);
        openMatch.setVenue(venue);
        openMatch.setHostTeam(hostTeam);
        openMatch.setTimeSlot(timeSlot);
        openMatch.setPitchType(5);
        openMatch.setSkillLevel(MatchSkillLevel.AVERAGE);
        openMatch.setMatchTime(LocalDateTime.now().plusDays(7));
        openMatch.setStatus(MatchStatus.OPEN);
    }

    // ==================== createMatch ====================

    @Nested
    @DisplayName("createMatch edge cases")
    class CreateMatchEdgeCases {

        @Test
        @DisplayName("createMatch when user has no team throws BusinessException")
        void createMatch_noTeam_throwsBusinessException() {
            User noTeamUser = new User("noteam", "noteam@email.com", "pass", "PLAYER");
            noTeamUser.setId(4);
            noTeamUser.setTeamId(null);
            UserPrincipal noTeamPrincipal = UserPrincipal.build(noTeamUser);

            when(userRepository.findById(4)).thenReturn(Optional.of(noTeamUser));
            when(teamRepository.findByCaptainId(4)).thenReturn(Optional.empty());

            CreateMatchRequest request = new CreateMatchRequest();
            request.setVenueId(5);
            request.setSkillLevel(MatchSkillLevel.AVERAGE);
            request.setTimeSlotId(6);
            request.setMatchDate(LocalDate.now().plusDays(7));
            request.setPitchType(5);

            assertThatThrownBy(() -> matchService.createMatch(noTeamPrincipal, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("đội trưởng");
        }

        @Test
        @DisplayName("createMatch when team is not approved throws BusinessException")
        void createMatch_teamNotApproved_throwsBusinessException() {
            Team pendingTeam = new Team();
            pendingTeam.setId(10L);
            pendingTeam.setStatus(TeamStatus.PENDING);
            pendingTeam.setCaptain(hostUser);

            when(teamRepository.findByCaptainId(1)).thenReturn(Optional.of(pendingTeam));

            CreateMatchRequest request = new CreateMatchRequest();
            request.setVenueId(5);
            request.setSkillLevel(MatchSkillLevel.AVERAGE);
            request.setTimeSlotId(6);
            request.setMatchDate(LocalDate.now().plusDays(7));
            request.setPitchType(5);

            assertThatThrownBy(() -> matchService.createMatch(hostPrincipal, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("đã được duyệt");
        }

        @Test
        @DisplayName("createMatch with past date throws BusinessException")
        void createMatch_pastDate_throwsBusinessException() {
            when(teamRepository.findByCaptainId(1)).thenReturn(Optional.of(hostTeam));
            when(timeSlotRepository.findById(6)).thenReturn(Optional.of(timeSlot));

            CreateMatchRequest request = new CreateMatchRequest();
            request.setVenueId(5);
            request.setSkillLevel(MatchSkillLevel.AVERAGE);
            request.setTimeSlotId(6);
            request.setMatchDate(LocalDate.now().minusDays(1));
            request.setPitchType(5);

            assertThatThrownBy(() -> matchService.createMatch(hostPrincipal, request))
                    .isInstanceOf(BusinessException.class);
        }

        @Test
        @DisplayName("createMatch with match time less than 12 hours in future throws BusinessException")
        void createMatch_tooSoon_throwsBusinessException() {
            when(teamRepository.findByCaptainId(1)).thenReturn(Optional.of(hostTeam));
            when(timeSlotRepository.findById(6)).thenReturn(Optional.of(timeSlot));
            when(venueRepository.findById(5)).thenReturn(Optional.of(venue));

            CreateMatchRequest request = new CreateMatchRequest();
            request.setVenueId(5);
            request.setSkillLevel(MatchSkillLevel.AVERAGE);
            request.setTimeSlotId(6);
            request.setMatchDate(LocalDate.now());
            request.setPitchType(5);

            assertThatThrownBy(() -> matchService.createMatch(hostPrincipal, request))
                    .isInstanceOf(Exception.class);
        }

        @Test
        @DisplayName("createMatch with non-existent venue throws ResourceNotFoundException")
        void createMatch_nonExistentVenue_throwsResourceNotFoundException() {
            when(teamRepository.findByCaptainId(1)).thenReturn(Optional.of(hostTeam));
            when(timeSlotRepository.findById(6)).thenReturn(Optional.of(timeSlot));
            when(venueRepository.findById(999)).thenReturn(Optional.empty());

            CreateMatchRequest request = new CreateMatchRequest();
            request.setVenueId(999);
            request.setSkillLevel(MatchSkillLevel.AVERAGE);
            request.setTimeSlotId(6);
            request.setMatchDate(LocalDate.now().plusDays(7));
            request.setPitchType(5);

            assertThatThrownBy(() -> matchService.createMatch(hostPrincipal, request))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // ==================== joinMatch ====================

    @Nested
    @DisplayName("joinMatch edge cases")
    class JoinMatchEdgeCases {

        @Test
        @DisplayName("joinMatch when user has no team throws BusinessException")
        void joinMatch_noTeam_throwsBusinessException() {
            User noTeamUser = new User("noteam", "noteam@email.com", "pass", "PLAYER");
            noTeamUser.setId(4);
            noTeamUser.setTeamId(null);
            UserPrincipal noTeamPrincipal = UserPrincipal.build(noTeamUser);

            when(userRepository.findById(4)).thenReturn(Optional.of(noTeamUser));

            assertThatThrownBy(() -> matchService.joinMatch(noTeamPrincipal, 100))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("đội bóng");
        }

        @Test
        @DisplayName("joinMatch when match status is not OPEN throws BusinessException")
        void joinMatch_notOpen_throwsBusinessException() {
            openMatch.setStatus(MatchStatus.SCHEDULED);

            when(userRepository.findById(2)).thenReturn(Optional.of(guestUser));
            when(teamRepository.findById(20L)).thenReturn(Optional.of(guestTeam));
            when(matchRepository.findByIdForUpdate(100)).thenReturn(Optional.of(openMatch));

            assertThatThrownBy(() -> matchService.joinMatch(guestPrincipal, 100))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("OPEN");
        }

        @Test
        @DisplayName("joinMatch when user is host team throws BusinessException")
        void joinMatch_isHostTeam_throwsBusinessException() {
            when(userRepository.findById(1)).thenReturn(Optional.of(hostUser));
            when(teamRepository.findById(10L)).thenReturn(Optional.of(hostTeam));
            when(matchRepository.findByIdForUpdate(100)).thenReturn(Optional.of(openMatch));

            assertThatThrownBy(() -> matchService.joinMatch(hostPrincipal, 100))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("chính đội mình");
        }

        @Test
        @DisplayName("joinMatch when team is not approved throws BusinessException")
        void joinMatch_teamNotApproved_throwsBusinessException() {
            Team pendingTeam = new Team();
            pendingTeam.setId(20L);
            pendingTeam.setStatus(TeamStatus.PENDING);
            pendingTeam.setCaptain(guestUser);

            when(userRepository.findById(2)).thenReturn(Optional.of(guestUser));
            when(teamRepository.findById(20L)).thenReturn(Optional.of(pendingTeam));

            assertThatThrownBy(() -> matchService.joinMatch(guestPrincipal, 100))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("đã được duyệt");
        }

        @Test
        @DisplayName("joinMatch with non-existent match throws ResourceNotFoundException")
        void joinMatch_nonExistentMatch_throwsResourceNotFoundException() {
            when(userRepository.findById(2)).thenReturn(Optional.of(guestUser));
            when(teamRepository.findById(20L)).thenReturn(Optional.of(guestTeam));
            when(matchRepository.findByIdForUpdate(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> matchService.joinMatch(guestPrincipal, 999))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("kèo đấu");
        }

        @Test
        @DisplayName("joinMatch when match is CANCELLED throws BusinessException")
        void joinMatch_cancelledMatch_throwsBusinessException() {
            openMatch.setStatus(MatchStatus.CANCELLED);

            when(userRepository.findById(2)).thenReturn(Optional.of(guestUser));
            when(teamRepository.findById(20L)).thenReturn(Optional.of(guestTeam));
            when(matchRepository.findByIdForUpdate(100)).thenReturn(Optional.of(openMatch));

            assertThatThrownBy(() -> matchService.joinMatch(guestPrincipal, 100))
                    .isInstanceOf(BusinessException.class);
        }
    }

    // ==================== approveMatchRequest ====================

    @Nested
    @DisplayName("approveMatchRequest edge cases")
    class ApproveMatchRequestEdgeCases {

        @Test
        @DisplayName("approveMatchRequest by non-host captain throws exception")
        void approveMatchRequest_byNonHostCaptain_throwsException() {
            MatchRequest matchRequest = new MatchRequest();
            matchRequest.setId(1);
            matchRequest.setMatch(openMatch);
            matchRequest.setGuestTeam(guestTeam);
            matchRequest.setCreatedByUser(guestUser);
            matchRequest.setStatus(MatchRequestStatus.PENDING_HOST_CAPTAIN);

            when(matchRequestRepository.findById(1)).thenReturn(Optional.of(matchRequest));
            when(userRepository.findById(3)).thenReturn(Optional.of(thirdUser));

            assertThatThrownBy(() -> matchService.approveMatchRequest(thirdPrincipal, 1))
                    .isInstanceOf(Exception.class);
        }

        @Test
        @DisplayName("approveMatchRequest PENDING_GUEST_CAPTAIN by non-guest captain throws BusinessException")
        void approveMatchRequest_pendingGuestByNonGuestCaptain_throwsBusinessException() {
            MatchRequest matchRequest = new MatchRequest();
            matchRequest.setId(2);
            matchRequest.setMatch(openMatch);
            matchRequest.setGuestTeam(guestTeam);
            matchRequest.setCreatedByUser(guestUser);
            matchRequest.setStatus(MatchRequestStatus.PENDING_GUEST_CAPTAIN);

            when(matchRequestRepository.findById(2)).thenReturn(Optional.of(matchRequest));
            when(userRepository.findById(3)).thenReturn(Optional.of(thirdUser));

            assertThatThrownBy(() -> matchService.approveMatchRequest(thirdPrincipal, 2))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("đội trưởng đội khách");
        }

        @Test
        @DisplayName("approveMatchRequest already processed (APPROVED) throws BusinessException")
        void approveMatchRequest_alreadyProcessed_throwsBusinessException() {
            MatchRequest matchRequest = new MatchRequest();
            matchRequest.setId(3);
            matchRequest.setMatch(openMatch);
            matchRequest.setGuestTeam(guestTeam);
            matchRequest.setCreatedByUser(guestUser);
            matchRequest.setStatus(MatchRequestStatus.APPROVED);

            when(matchRequestRepository.findById(3)).thenReturn(Optional.of(matchRequest));
            when(userRepository.findById(1)).thenReturn(Optional.of(hostUser));

            assertThatThrownBy(() -> matchService.approveMatchRequest(hostPrincipal, 3))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("đã được xử lý");
        }

        @Test
        @DisplayName("approveMatchRequest already rejected throws BusinessException")
        void approveMatchRequest_alreadyRejected_throwsBusinessException() {
            MatchRequest matchRequest = new MatchRequest();
            matchRequest.setId(4);
            matchRequest.setMatch(openMatch);
            matchRequest.setGuestTeam(guestTeam);
            matchRequest.setCreatedByUser(guestUser);
            matchRequest.setStatus(MatchRequestStatus.REJECTED);

            when(matchRequestRepository.findById(4)).thenReturn(Optional.of(matchRequest));
            when(userRepository.findById(1)).thenReturn(Optional.of(hostUser));

            assertThatThrownBy(() -> matchService.approveMatchRequest(hostPrincipal, 4))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("đã được xử lý");
        }

        @Test
        @DisplayName("approveMatchRequest with non-existent request throws ResourceNotFoundException")
        void approveMatchRequest_nonExistentRequest_throwsResourceNotFoundException() {
            when(matchRequestRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> matchService.approveMatchRequest(hostPrincipal, 999))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("yêu cầu");
        }
    }

    // ==================== getOpenMatches ====================

    @Nested
    @DisplayName("getOpenMatches edge cases")
    class GetOpenMatchesTests {

        @Test
        @DisplayName("getOpenMatches returns only OPEN matches")
        void getOpenMatches_returnsOnlyOpenMatches() {
            Match openMatch2 = new Match();
            openMatch2.setId(101);
            openMatch2.setVenue(venue);
            openMatch2.setHostTeam(hostTeam);
            openMatch2.setTimeSlot(timeSlot);
            openMatch2.setPitchType(5);
            openMatch2.setSkillLevel(MatchSkillLevel.GOOD);
            openMatch2.setMatchTime(LocalDateTime.now().plusDays(8));
            openMatch2.setStatus(MatchStatus.OPEN);

            when(matchRepository.findOpenMatches(null, null)).thenReturn(List.of(openMatch, openMatch2));

            List<MatchResponse> result = matchService.getOpenMatches(null, null);

            assertThat(result).hasSize(2);
            assertThat(result).allMatch(m -> m.getStatus() == MatchStatus.OPEN);
        }

        @Test
        @DisplayName("getOpenMatches returns empty list when no open matches exist")
        void getOpenMatches_noOpenMatches_returnsEmptyList() {
            when(matchRepository.findOpenMatches(null, null)).thenReturn(Collections.emptyList());

            List<MatchResponse> result = matchService.getOpenMatches(null, null);

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("getOpenMatches filters by venueId when provided")
        void getOpenMatches_withVenueId_filtersByVenueId() {
            when(matchRepository.findOpenMatches(5, null)).thenReturn(List.of(openMatch));

            List<MatchResponse> result = matchService.getOpenMatches(5, null);

            assertThat(result).hasSize(1);
            verify(matchRepository).findOpenMatches(5, null);
        }

        @Test
        @DisplayName("getOpenMatches filters by skillLevel when provided")
        void getOpenMatches_withSkillLevel_filtersBySkillLevel() {
            when(matchRepository.findOpenMatches(null, MatchSkillLevel.AVERAGE)).thenReturn(List.of(openMatch));

            List<MatchResponse> result = matchService.getOpenMatches(null, MatchSkillLevel.AVERAGE);

            assertThat(result).hasSize(1);
            verify(matchRepository).findOpenMatches(null, MatchSkillLevel.AVERAGE);
        }

        @Test
        @DisplayName("getOpenMatches with user principal sorts by recommendation")
        void getOpenMatches_withUserPrincipal_sortedByRelevance() {
            when(matchRepository.findOpenMatches(null, null)).thenReturn(List.of(openMatch));
            when(userRepository.findById(1)).thenReturn(Optional.of(hostUser));
            when(teamRepository.findById(10L)).thenReturn(Optional.of(hostTeam));
            when(matchRepository.findByHostOrGuestTeamId(10L)).thenReturn(Collections.emptyList());

            List<MatchResponse> result = matchService.getOpenMatches(hostPrincipal, null, null);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getHostTeamId()).isEqualTo(10L);
        }
    }

    // ==================== submitMatchResult ====================

    @Nested
    @DisplayName("submitMatchResult edge cases")
    class SubmitMatchResultEdgeCases {

        @Test
        @DisplayName("submitMatchResult for cancelled match throws BusinessException")
        void submitMatchResult_cancelledMatch_throwsBusinessException() {
            openMatch.setStatus(MatchStatus.CANCELLED);
            when(matchRepository.findById(100)).thenReturn(Optional.of(openMatch));

            com.kstn.group4.backend.match.dto.MatchResultSubmitRequest request =
                    new com.kstn.group4.backend.match.dto.MatchResultSubmitRequest();
            request.setHomeScore(2);
            request.setAwayScore(1);

            assertThatThrownBy(() -> matchService.submitMatchResult(100, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("CANCELLED");
        }

        @Test
        @DisplayName("submitMatchResult for OPEN match throws BusinessException")
        void submitMatchResult_openMatch_throwsBusinessException() {
            when(matchRepository.findById(100)).thenReturn(Optional.of(openMatch));

            com.kstn.group4.backend.match.dto.MatchResultSubmitRequest request =
                    new com.kstn.group4.backend.match.dto.MatchResultSubmitRequest();
            request.setHomeScore(2);
            request.setAwayScore(1);

            assertThatThrownBy(() -> matchService.submitMatchResult(100, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("OPEN");
        }

        @Test
        @DisplayName("submitMatchResult for non-existent match throws ResourceNotFoundException")
        void submitMatchResult_nonExistentMatch_throwsResourceNotFoundException() {
            when(matchRepository.findById(999)).thenReturn(Optional.empty());

            com.kstn.group4.backend.match.dto.MatchResultSubmitRequest request =
                    new com.kstn.group4.backend.match.dto.MatchResultSubmitRequest();
            request.setHomeScore(2);
            request.setAwayScore(1);

            assertThatThrownBy(() -> matchService.submitMatchResult(999, request))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
