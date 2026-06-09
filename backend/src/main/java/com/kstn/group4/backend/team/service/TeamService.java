package com.kstn.group4.backend.team.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kstn.group4.backend.activitylog.service.ActivityLogService;
import com.kstn.group4.backend.config.security.services.UserPrincipal;
import com.kstn.group4.backend.exception.BusinessException;
import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.match.entity.Match;
import com.kstn.group4.backend.match.repository.MatchRepository;
import com.kstn.group4.backend.team.dto.CreateTeamRequest;
import com.kstn.group4.backend.team.dto.TeamMemberResponse;
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

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final MatchRepository matchRepository;
    private final ActivityLogService activityLogService;

    @Transactional
    public TeamResponse createTeam(UserPrincipal userPrincipal, CreateTeamRequest request) {
        User captain = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng", "User"));

        if (teamRepository.findByCaptainId(captain.getId()).isPresent()) {
            throw new BusinessException("Bạn đã là đội trưởng của một đội bóng khác");
        }

        if (captain.getTeamId() != null) {
            throw new BusinessException("Bạn đã thuộc một đội bóng khác");
        }

        if (teamRepository.existsByName(request.getName())) {
            throw new BusinessException("Tên đội bóng đã được sử dụng");
        }

        Team team = new Team();
        team.setName(request.getName());
        team.setCaptain(captain);
        team.setDescription(request.getDescription());
        team.setStatus(TeamStatus.PENDING);
        final Team savedTeam = teamRepository.save(team);

        captain.setTeamId(savedTeam.getId());
        userRepository.save(captain);

        List<TeamMember> members = new ArrayList<>();
        // Add captain as ACTIVE member
        members.add(new TeamMember(savedTeam, captain.getEmail(), TeamMemberStatus.ACTIVE));

        // Add invited members
        if (request.getMemberEmails() != null) {
            for (String email : request.getMemberEmails()) {
                if (email != null && !email.trim().isEmpty() && !email.equalsIgnoreCase(captain.getEmail())) {
                    String trimmedEmail = email.trim();
                    var userOpt = userRepository.findByEmail(trimmedEmail);
                    if (userOpt.isPresent()) {
                        User existingUser = userOpt.get();
                        if (existingUser.getTeamId() != null) {
                            throw new BusinessException("Người dùng " + trimmedEmail + " đã thuộc một đội bóng khác");
                        }
                        members.add(new TeamMember(savedTeam, trimmedEmail, TeamMemberStatus.INVITED));
                        existingUser.setTeamId(savedTeam.getId());
                        userRepository.save(existingUser);
                    } else {
                        members.add(new TeamMember(savedTeam, trimmedEmail, TeamMemberStatus.INVITED));
                    }
                }
            }
        }

        teamMemberRepository.saveAll(members);

        return buildTeamResponse(savedTeam, members);
    }

    @Transactional(readOnly = true)
    public List<TeamResponse> getPendingTeams() {
        return mapToResponseList(teamRepository.findByStatus(TeamStatus.PENDING));
    }

    @Transactional(readOnly = true)
    public List<TeamResponse> getAllTeams() {
        return mapToResponseList(teamRepository.findAll());
    }

    private void logAdminActivity(String actionType, String targetId, String description) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        Integer adminId = null;
        String adminName = "System";
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            adminId = principal.getId();
            adminName = principal.getAppUsername();
        }
        activityLogService.log(adminId, adminName, actionType, "TEAM", targetId, description, null, null);
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
            logAdminActivity("APPROVE_TEAM", teamId.toString(), "Phê duyệt đội bóng: " + team.getName());
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

        logAdminActivity("DELETE_TEAM", teamId.toString(), "Xóa đội bóng: " + team.getName());
    }

    @Transactional
    public TeamResponse addReputation(Long teamId, Integer amount) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đội bóng với ID: " + teamId, "Team"));
        team.setReputationScore(team.getReputationScore() + amount);
        teamRepository.save(team);
        logAdminActivity("ADD_TEAM_REPUTATION", teamId.toString(), "Cộng " + amount + " điểm uy tín cho đội " + team.getName());
        return mapToResponse(team);
    }

    @Transactional
    public TeamResponse deductReputation(Long teamId, Integer amount) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đội bóng với ID: " + teamId, "Team"));
        team.setReputationScore(Math.max(0, team.getReputationScore() - amount));
        teamRepository.save(team);
        logAdminActivity("DEDUCT_TEAM_REPUTATION", teamId.toString(), "Trừ " + amount + " điểm uy tín của đội " + team.getName());
        return mapToResponse(team);
    }

    @Transactional
    public TeamResponse banTeam(Long teamId, Integer days) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đội bóng với ID: " + teamId, "Team"));
        team.setStatus(TeamStatus.BANNED);
        team.setBannedUntil(LocalDateTime.now().plusDays(days));
        teamRepository.save(team);
        logAdminActivity("BAN_TEAM", teamId.toString(), "Cấm đội bóng: " + team.getName() + " trong " + days + " ngày");
        return mapToResponse(team);
    }

    private TeamResponse mapToResponse(Team team) {
        List<TeamMember> members = teamMemberRepository.findByTeamId(team.getId());
        return buildTeamResponse(team, members);
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
        return mapToResponseList(teamRepository.findByStatus(TeamStatus.APPROVED));
    }

    private List<TeamResponse> mapToResponseList(List<Team> teams) {
        if (teams.isEmpty()) {
            return new ArrayList<>();
        }

        List<Long> teamIds = teams.stream().map(Team::getId).collect(Collectors.toList());
        List<TeamMember> allMembers = teamMemberRepository.findByTeamIdIn(teamIds);

        java.util.Map<Long, List<TeamMember>> membersMap = allMembers.stream()
                .collect(Collectors.groupingBy(
                        m -> m.getTeam().getId()
                ));

        return teams.stream()
                .map(team -> buildTeamResponse(team, membersMap.getOrDefault(team.getId(), new ArrayList<>())))
                .collect(Collectors.toList());
    }

    private TeamResponse buildTeamResponse(Team team, List<TeamMember> members) {
        List<TeamMember> orderedMembers = orderMembersWithCaptainFirst(team, members);
        List<String> memberEmails = orderedMembers.stream()
                .map(member -> member.getId().getUserEmail())
                .collect(Collectors.toList());
        List<TeamMemberResponse> memberDetails = orderedMembers.stream()
                .map(member -> new TeamMemberResponse(member.getId().getUserEmail(), member.getStatus()))
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
                memberEmails,
                memberDetails
        );
    }

    private List<TeamMember> orderMembersWithCaptainFirst(Team team, List<TeamMember> members) {
        String captainEmail = team.getCaptain().getEmail();
        List<TeamMember> membersWithCaptain = new ArrayList<>(members);
        boolean hasCaptainMember = membersWithCaptain.stream()
                .anyMatch(member -> member.getId().getUserEmail().equalsIgnoreCase(captainEmail));
        if (!hasCaptainMember) {
            membersWithCaptain.add(new TeamMember(team, captainEmail, TeamMemberStatus.ACTIVE));
        }

        return membersWithCaptain.stream()
                .sorted((left, right) -> {
                    boolean leftIsCaptain = left.getId().getUserEmail().equalsIgnoreCase(captainEmail);
                    boolean rightIsCaptain = right.getId().getUserEmail().equalsIgnoreCase(captainEmail);
                    if (leftIsCaptain == rightIsCaptain) {
                        return left.getId().getUserEmail().compareToIgnoreCase(right.getId().getUserEmail());
                    }
                    return leftIsCaptain ? -1 : 1;
                })
                .collect(Collectors.toList());
    }

    // ==================== IMPLEMENTS ĐẦY ĐỦ CÁC HÀM XỬ LÝ MỚI ====================

    /**
     * Nghiệp vụ 1: Đội trưởng gửi lời mời thành viên tham gia qua Email
     */
    @Transactional
    public void inviteMember(UserPrincipal userPrincipal, Long teamId, String email) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đội bóng với ID: " + teamId, "Team"));

        // 1. Kiểm tra xem người thao tác có phải Đội trưởng không
        if (!team.getCaptain().getId().equals(userPrincipal.getId())) {
            throw new BusinessException("Bạn không phải là đội trưởng của đội bóng này!");
        }

        String trimmedEmail = email.trim();

        // 2. Không cho phép tự mời chính mình
        if (trimmedEmail.equalsIgnoreCase(team.getCaptain().getEmail())) {
            throw new BusinessException("Bạn đã là đội trưởng và đang tham gia đội bóng này!");
        }

        // 3. Kiểm tra email đã có trong đội chưa
        List<TeamMember> currentMembers = teamMemberRepository.findByTeamId(teamId);
        boolean isAlreadyInTeam = currentMembers.stream()
                .anyMatch(m -> m.getId().getUserEmail().equalsIgnoreCase(trimmedEmail));
        if (isAlreadyInTeam) {
            throw new BusinessException("Người dùng này đã ở trong đội hoặc đã nhận được lời mời trước đó!");
        }

        var userOpt = userRepository.findByEmail(trimmedEmail);
        if (userOpt.isPresent()) {
            User existingUser = userOpt.get();
            if (existingUser.getTeamId() != null && !existingUser.getTeamId().equals(team.getId())) {
                throw new BusinessException("Người dùng này đang thuộc một đội bóng khác!");
            }
        }

        // 4. Lưu bản ghi TeamMember mới với trạng thái INVITED
        TeamMember newMember = new TeamMember(team, trimmedEmail, TeamMemberStatus.INVITED);
        teamMemberRepository.save(newMember);

        // 5. Nếu user đã đăng ký tài khoản hệ thống, cập nhật teamId của họ
        if (userOpt.isPresent()) {
            User existingUser = userOpt.get();
            existingUser.setTeamId(team.getId());
            userRepository.save(existingUser);
        }
    }

    /**
     * Nghiệp vụ 2: Đội trưởng duyệt thành viên từ INVITED thành ACTIVE
     */
    @Transactional
    public void approveMember(UserPrincipal userPrincipal, Long teamId, String email) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đội bóng với ID: " + teamId, "Team"));

        // 1. Kiểm tra quyền Đội trưởng
        if (!team.getCaptain().getId().equals(userPrincipal.getId())) {
            throw new BusinessException("Bạn không phải là đội trưởng của đội bóng này!");
        }

        // 2. Tìm thành viên trong danh sách đội dựa theo email ẩn phía dưới Composite Key
        TeamMember targetMember = teamMemberRepository.findByTeamId(teamId).stream()
                .filter(m -> m.getId().getUserEmail().equalsIgnoreCase(email.trim()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thành viên mang email này trong đội bóng", "TeamMember"));

        // 3. Nếu thành viên đã active từ trước thì báo lỗi
        if (targetMember.getStatus() == TeamMemberStatus.ACTIVE) {
            throw new BusinessException("Thành viên này đã được phê duyệt hoạt động từ trước!");
        }

        // 4. Chuyển trạng thái sang ACTIVE
        targetMember.setStatus(TeamMemberStatus.ACTIVE);
        teamMemberRepository.save(targetMember);
    }

    /**
     * Nghiệp vụ 3: Đội trưởng loại bỏ (Kick) thành viên ra khỏi đội
     */
    @Transactional
    public void kickMember(UserPrincipal userPrincipal, Long teamId, String email) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đội bóng với ID: " + teamId, "Team"));

        // 1. Kiểm tra quyền Đội trưởng
        if (!team.getCaptain().getId().equals(userPrincipal.getId())) {
            throw new BusinessException("Bạn không phải là đội trưởng của đội bóng này!");
        }

        String trimmedEmail = email.trim();

        // 2. Không cho phép đội trưởng tự kick chính mình
        if (trimmedEmail.equalsIgnoreCase(team.getCaptain().getEmail())) {
            throw new BusinessException("Bạn là đội trưởng, không thể tự loại mình khỏi đội! Hãy chọn giải pháp xóa đội bóng.");
        }

        // 3. Tìm bản ghi thành viên để xóa
        TeamMember targetMember = teamMemberRepository.findByTeamId(teamId).stream()
                .filter(m -> m.getId().getUserEmail().equalsIgnoreCase(trimmedEmail))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Thành viên này không tồn tại trong đội bóng này", "TeamMember"));

        // 4. Xóa bản ghi trong bảng team_member
        teamMemberRepository.delete(targetMember);

        // 5. Gỡ bỏ liên kết trường teamId về null trong bảng User của người bị kích
        var userOpt = userRepository.findByEmail(trimmedEmail);
        if (userOpt.isPresent()) {
            User regularUser = userOpt.get();
            regularUser.setTeamId(null);
            userRepository.save(regularUser);
        }
    }

    @Transactional
    public void leaveTeam(UserPrincipal userPrincipal, Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đội bóng với ID: " + teamId, "Team"));

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng", "User"));

        if (team.getCaptain().getId().equals(userPrincipal.getId())
                || user.getEmail().equalsIgnoreCase(team.getCaptain().getEmail())) {
            throw new BusinessException("Đội trưởng không thể rời đội bằng chức năng này. Hãy liên hệ quản trị viên nếu cần giải tán đội.");
        }

        TeamMember targetMember = teamMemberRepository.findByTeamId(teamId).stream()
                .filter(member -> member.getId().getUserEmail().equalsIgnoreCase(user.getEmail()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Bạn không thuộc đội bóng này", "TeamMember"));

        teamMemberRepository.delete(targetMember);

        if (user.getTeamId() != null && user.getTeamId().equals(teamId)) {
            user.setTeamId(null);
            userRepository.save(user);
        }
    }

    // ==================== IMPLEMENTS ĐẦY ĐỦ CÁC HÀM XỬ LÝ MỚI ====================

    /**
     * Nghiệp vụ 1: Đội trưởng gửi lời mời thành viên tham gia qua Email
     */
    @Transactional
    public void inviteMember(UserPrincipal userPrincipal, Long teamId, String email) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đội bóng với ID: " + teamId, "Team"));

        // 1. Kiểm tra xem người thao tác có phải Đội trưởng không
        if (!team.getCaptain().getId().equals(userPrincipal.getId())) {
            throw new BusinessException("Bạn không phải là đội trưởng của đội bóng này!");
        }

        String trimmedEmail = email.trim();

        // 2. Không cho phép tự mời chính mình
        if (trimmedEmail.equalsIgnoreCase(team.getCaptain().getEmail())) {
            throw new BusinessException("Bạn đã là đội trưởng và đang tham gia đội bóng này!");
        }

        // 3. Kiểm tra email đã có trong đội chưa
        List<TeamMember> currentMembers = teamMemberRepository.findByTeamId(teamId);
        boolean isAlreadyInTeam = currentMembers.stream()
                .anyMatch(m -> m.getId().getUserEmail().equalsIgnoreCase(trimmedEmail));
        if (isAlreadyInTeam) {
            throw new BusinessException("Người dùng này đã ở trong đội hoặc đã nhận được lời mời trước đó!");
        }

        // 4. Lưu bản ghi TeamMember mới với trạng thái INVITED
        TeamMember newMember = new TeamMember(team, trimmedEmail, TeamMemberStatus.INVITED);
        teamMemberRepository.save(newMember);

        // 5. Nếu user đã đăng ký tài khoản hệ thống, cập nhật teamId của họ
        var userOpt = userRepository.findByEmail(trimmedEmail);
        if (userOpt.isPresent()) {
            User existingUser = userOpt.get();
            existingUser.setTeamId(team.getId());
            userRepository.save(existingUser);
        }
    }

    /**
     * Nghiệp vụ 2: Đội trưởng duyệt thành viên từ INVITED thành ACTIVE
     */
    @Transactional
    public void approveMember(UserPrincipal userPrincipal, Long teamId, String email) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đội bóng với ID: " + teamId, "Team"));

        // 1. Kiểm tra quyền Đội trưởng
        if (!team.getCaptain().getId().equals(userPrincipal.getId())) {
            throw new BusinessException("Bạn không phải là đội trưởng của đội bóng này!");
        }

        // 2. Tìm thành viên trong danh sách đội dựa theo email ẩn phía dưới Composite Key
        TeamMember targetMember = teamMemberRepository.findByTeamId(teamId).stream()
                .filter(m -> m.getId().getUserEmail().equalsIgnoreCase(email.trim()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thành viên mang email này trong đội bóng", "TeamMember"));

        // 3. Nếu thành viên đã active từ trước thì báo lỗi
        if (targetMember.getStatus() == TeamMemberStatus.ACTIVE) {
            throw new BusinessException("Thành viên này đã được phê duyệt hoạt động từ trước!");
        }

        // 4. Chuyển trạng thái sang ACTIVE
        targetMember.setStatus(TeamMemberStatus.ACTIVE);
        teamMemberRepository.save(targetMember);
    }

    /**
     * Nghiệp vụ 3: Đội trưởng loại bỏ (Kick) thành viên ra khỏi đội
     */
    @Transactional
    public void kickMember(UserPrincipal userPrincipal, Long teamId, String email) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đội bóng với ID: " + teamId, "Team"));

        // 1. Kiểm tra quyền Đội trưởng
        if (!team.getCaptain().getId().equals(userPrincipal.getId())) {
            throw new BusinessException("Bạn không phải là đội trưởng của đội bóng này!");
        }

        String trimmedEmail = email.trim();

        // 2. Không cho phép đội trưởng tự kick chính mình
        if (trimmedEmail.equalsIgnoreCase(team.getCaptain().getEmail())) {
            throw new BusinessException("Bạn là đội trưởng, không thể tự loại mình khỏi đội! Hãy chọn giải pháp xóa đội bóng.");
        }

        // 3. Tìm bản ghi thành viên để xóa
        TeamMember targetMember = teamMemberRepository.findByTeamId(teamId).stream()
                .filter(m -> m.getId().getUserEmail().equalsIgnoreCase(trimmedEmail))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Thành viên này không tồn tại trong đội bóng này", "TeamMember"));

        // 4. Xóa bản ghi trong bảng team_member
        teamMemberRepository.delete(targetMember);

        // 5. Gỡ bỏ liên kết trường teamId về null trong bảng User của người bị kích
        var userOpt = userRepository.findByEmail(trimmedEmail);
        if (userOpt.isPresent()) {
            User regularUser = userOpt.get();
            regularUser.setTeamId(null);
            userRepository.save(regularUser);
        }
    }
}