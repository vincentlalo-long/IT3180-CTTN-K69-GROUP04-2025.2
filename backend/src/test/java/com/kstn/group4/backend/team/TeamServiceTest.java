package com.kstn.group4.backend.team;

import com.kstn.group4.backend.activitylog.service.ActivityLogService;
import com.kstn.group4.backend.config.security.services.UserPrincipal;
import com.kstn.group4.backend.exception.BusinessException;
import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.match.enums.MatchSkillLevel;
import com.kstn.group4.backend.match.repository.MatchRepository;
import com.kstn.group4.backend.notification.service.NotificationService;
import com.kstn.group4.backend.team.dto.CreateTeamRequest;
import com.kstn.group4.backend.team.dto.TeamResponse;
import com.kstn.group4.backend.team.entity.Team;
import com.kstn.group4.backend.team.entity.TeamMember;
import com.kstn.group4.backend.team.enums.TeamMemberStatus;
import com.kstn.group4.backend.team.enums.TeamStatus;
import com.kstn.group4.backend.team.repository.TeamMemberRepository;
import com.kstn.group4.backend.team.repository.TeamRepository;
import com.kstn.group4.backend.team.service.TeamService;
import com.kstn.group4.backend.user.entity.User;
import com.kstn.group4.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TeamServiceTest {

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private TeamMemberRepository teamMemberRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MatchRepository matchRepository;

    @Mock
    private ActivityLogService activityLogService;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private TeamService teamService;

    private User testUser;
    private UserPrincipal userPrincipal;
    private CreateTeamRequest createTeamRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1);
        testUser.setUsername("testplayer");
        testUser.setEmail("testplayer@test.com");
        testUser.setPassword("password");
        testUser.setRole("PLAYER");

        userPrincipal = new UserPrincipal(
                1,
                "testplayer@test.com",
                "testplayer",
                "testplayer@test.com",
                "password",
                "PLAYER",
                Collections.emptyList()
        );

        createTeamRequest = new CreateTeamRequest();
        createTeamRequest.setName("FC Test");
        createTeamRequest.setDescription("A test team");
        createTeamRequest.setSkillLevel(MatchSkillLevel.AVERAGE);
        createTeamRequest.setMemberEmails(new ArrayList<>());
    }

    @Test
    void createTeam_successfully() {
        when(userRepository.findById(1)).thenReturn(Optional.of(testUser));
        when(teamRepository.findByCaptainId(1)).thenReturn(Optional.empty());
        when(teamRepository.existsByName("FC Test")).thenReturn(false);

        when(teamRepository.save(any(Team.class))).thenAnswer(invocation -> {
            Team team = invocation.getArgument(0);
            team.setId(1L);
            return team;
        });

        TeamResponse response = teamService.createTeam(userPrincipal, createTeamRequest);

        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo("FC Test");
        assertThat(response.getCaptainId()).isEqualTo(1);
        assertThat(response.getStatus()).isEqualTo(TeamStatus.PENDING);
        assertThat(response.getSkillLevel()).isEqualTo(MatchSkillLevel.AVERAGE);

        verify(teamRepository).save(any(Team.class));
        verify(userRepository).save(testUser);
        verify(teamMemberRepository).saveAll(anyList());
        verify(notificationService).createNotificationForAdmins(
                any(), eq("Yêu cầu phê duyệt đội bóng mới"), anyString(), anyString(), anyString()
        );
    }

    @Test
    void createTeam_duplicateName_throwsBusinessException() {
        when(userRepository.findById(1)).thenReturn(Optional.of(testUser));
        when(teamRepository.findByCaptainId(1)).thenReturn(Optional.empty());
        when(teamRepository.existsByName("FC Test")).thenReturn(true);

        assertThatThrownBy(() -> teamService.createTeam(userPrincipal, createTeamRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Tên đội bóng đã được sử dụng");

        verify(teamRepository, never()).save(any());
    }

    @Test
    void createTeam_userAlreadyCaptain_throwsBusinessException() {
        Team existingTeam = new Team();
        existingTeam.setId(99L);
        existingTeam.setName("Existing Team");

        when(userRepository.findById(1)).thenReturn(Optional.of(testUser));
        when(teamRepository.findByCaptainId(1)).thenReturn(Optional.of(existingTeam));

        assertThatThrownBy(() -> teamService.createTeam(userPrincipal, createTeamRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Bạn đã là đội trưởng của một đội bóng khác");
    }

    @Test
    void createTeam_userAlreadyInTeam_throwsBusinessException() {
        testUser.setTeamId(5L);

        when(userRepository.findById(1)).thenReturn(Optional.of(testUser));
        when(teamRepository.findByCaptainId(1)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> teamService.createTeam(userPrincipal, createTeamRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Bạn đã thuộc một đội bóng khác");
    }

    @Test
    void getTeamDetailsById_returnsTeam() {
        Team team = new Team();
        team.setId(1L);
        team.setName("FC Test");
        team.setCaptain(testUser);
        team.setStatus(TeamStatus.APPROVED);
        team.setSkillLevel(MatchSkillLevel.AVERAGE);
        team.setReputationScore(100);

        when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
        when(teamMemberRepository.findByTeamId(1L)).thenReturn(Collections.emptyList());

        TeamResponse response = teamService.getTeamDetailsById(1L);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("FC Test");
        assertThat(response.getStatus()).isEqualTo(TeamStatus.APPROVED);
    }

    @Test
    void getTeamDetailsById_invalidId_throwsResourceNotFoundException() {
        when(teamRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> teamService.getTeamDetailsById(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void joinTeam_addsMember() {
        User member = new User();
        member.setId(2);
        member.setUsername("member1");
        member.setEmail("member1@test.com");
        member.setTeamId(null);

        UserPrincipal memberPrincipal = new UserPrincipal(
                2,
                "member1@test.com",
                "member1",
                "member1@test.com",
                "password",
                "PLAYER",
                Collections.emptyList()
        );

        Team team = new Team();
        team.setId(10L);
        team.setName("FC Test");
        team.setCaptain(testUser);
        team.setStatus(TeamStatus.APPROVED);

        when(userRepository.findById(2)).thenReturn(Optional.of(member));
        when(teamRepository.findById(10L)).thenReturn(Optional.of(team));
        when(teamMemberRepository.findByTeamId(10L)).thenReturn(new ArrayList<>());
        when(teamMemberRepository.save(any(TeamMember.class))).thenAnswer(inv -> inv.getArgument(0));

        teamService.joinTeam(memberPrincipal, 10L);

        ArgumentCaptor<TeamMember> captor = ArgumentCaptor.forClass(TeamMember.class);
        verify(teamMemberRepository).save(captor.capture());

        TeamMember savedMember = captor.getValue();
        assertThat(savedMember.getStatus()).isEqualTo(TeamMemberStatus.REQUESTED);
        assertThat(savedMember.getId().getUserEmail()).isEqualTo("member1@test.com");
        assertThat(savedMember.getId().getTeamId()).isEqualTo(10L);

        verify(notificationService).createNotification(
                eq(testUser.getId()),
                any(),
                eq("Yêu cầu gia nhập đội bóng"),
                anyString(),
                anyString(),
                eq("10")
        );
    }

    @Test
    void joinTeam_alreadyMember_throwsBusinessException() {
        User member = new User();
        member.setId(2);
        member.setUsername("member1");
        member.setEmail("member1@test.com");
        member.setTeamId(10L);

        UserPrincipal memberPrincipal = new UserPrincipal(
                2,
                "member1@test.com",
                "member1",
                "member1@test.com",
                "password",
                "PLAYER",
                Collections.emptyList()
        );

        Team team = new Team();
        team.setId(10L);
        team.setName("FC Test");
        team.setCaptain(testUser);
        team.setStatus(TeamStatus.APPROVED);

        when(userRepository.findById(2)).thenReturn(Optional.of(member));

        assertThatThrownBy(() -> teamService.joinTeam(memberPrincipal, 10L))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Bạn đã thuộc một đội bóng khác!");

        verify(teamMemberRepository, never()).save(any());
    }

    @Test
    void joinTeam_teamNotApproved_throwsBusinessException() {
        User member = new User();
        member.setId(2);
        member.setUsername("member1");
        member.setEmail("member1@test.com");
        member.setTeamId(null);

        UserPrincipal memberPrincipal = new UserPrincipal(
                2,
                "member1@test.com",
                "member1",
                "member1@test.com",
                "password",
                "PLAYER",
                Collections.emptyList()
        );

        Team team = new Team();
        team.setId(10L);
        team.setName("FC Test");
        team.setCaptain(testUser);
        team.setStatus(TeamStatus.PENDING);

        when(userRepository.findById(2)).thenReturn(Optional.of(member));
        when(teamRepository.findById(10L)).thenReturn(Optional.of(team));

        assertThatThrownBy(() -> teamService.joinTeam(memberPrincipal, 10L))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Đội bóng chưa được phê duyệt hoạt động!");

        verify(teamMemberRepository, never()).save(any());
    }

    @Test
    void joinTeam_alreadyRequested_throwsBusinessException() {
        User member = new User();
        member.setId(2);
        member.setUsername("member1");
        member.setEmail("member1@test.com");
        member.setTeamId(null);

        UserPrincipal memberPrincipal = new UserPrincipal(
                2,
                "member1@test.com",
                "member1",
                "member1@test.com",
                "password",
                "PLAYER",
                Collections.emptyList()
        );

        Team team = new Team();
        team.setId(10L);
        team.setName("FC Test");
        team.setCaptain(testUser);
        team.setStatus(TeamStatus.APPROVED);

        TeamMember existingMember = new TeamMember(team, "member1@test.com", TeamMemberStatus.REQUESTED);

        when(userRepository.findById(2)).thenReturn(Optional.of(member));
        when(teamRepository.findById(10L)).thenReturn(Optional.of(team));
        when(teamMemberRepository.findByTeamId(10L)).thenReturn(List.of(existingMember));

        assertThatThrownBy(() -> teamService.joinTeam(memberPrincipal, 10L))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Bạn đã gửi yêu cầu gia nhập hoặc đã tham gia đội bóng này trước đó!");
    }
}
