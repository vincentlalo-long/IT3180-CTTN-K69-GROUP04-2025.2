package com.kstn.group4.backend.league.service;

import com.kstn.group4.backend.exception.ForbiddenException;
import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.league.dto.*;
import com.kstn.group4.backend.league.entity.League;
import com.kstn.group4.backend.league.entity.LeagueAnnouncement;
import com.kstn.group4.backend.league.entity.LeagueAnnouncementComment;
import com.kstn.group4.backend.league.repository.LeagueAnnouncementCommentRepository;
import com.kstn.group4.backend.league.repository.LeagueAnnouncementRepository;
import com.kstn.group4.backend.league.repository.LeagueRepository;
import com.kstn.group4.backend.user.entity.User;
import com.kstn.group4.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeagueAnnouncementServiceImpl implements LeagueAnnouncementService {

    private final LeagueRepository leagueRepository;
    private final LeagueAnnouncementRepository leagueAnnouncementRepository;
    private final LeagueAnnouncementCommentRepository leagueAnnouncementCommentRepository;
    private final UserRepository userRepository;

    public LeagueAnnouncementServiceImpl(
            LeagueRepository leagueRepository,
            LeagueAnnouncementRepository leagueAnnouncementRepository,
            LeagueAnnouncementCommentRepository leagueAnnouncementCommentRepository,
            UserRepository userRepository) {
        this.leagueRepository = leagueRepository;
        this.leagueAnnouncementRepository = leagueAnnouncementRepository;
        this.leagueAnnouncementCommentRepository = leagueAnnouncementCommentRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public LeagueAnnouncementResponse createAnnouncement(Integer leagueId, LeagueAnnouncementRequest request, Integer managerId) {
        League league = leagueRepository.findById(leagueId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giải đấu"));

        if (!league.getManager().getId().equals(managerId)) {
            throw new ForbiddenException("Bạn không có quyền đăng thông báo cho giải đấu này");
        }

        LeagueAnnouncement announcement = new LeagueAnnouncement();
        announcement.setLeague(league);
        announcement.setTitle(request.getTitle());
        announcement.setContent(request.getContent());

        LeagueAnnouncement saved = leagueAnnouncementRepository.save(announcement);
        return LeagueAnnouncementResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public LeagueAnnouncementResponse updateAnnouncement(Integer announcementId, LeagueAnnouncementRequest request, Integer managerId) {
        LeagueAnnouncement announcement = leagueAnnouncementRepository.findById(announcementId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông báo"));

        League league = announcement.getLeague();
        if (!league.getManager().getId().equals(managerId)) {
            throw new ForbiddenException("Bạn không có quyền chỉnh sửa thông báo này");
        }

        announcement.setTitle(request.getTitle());
        announcement.setContent(request.getContent());

        LeagueAnnouncement updated = leagueAnnouncementRepository.save(announcement);
        return LeagueAnnouncementResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteAnnouncement(Integer announcementId, Integer managerId) {
        LeagueAnnouncement announcement = leagueAnnouncementRepository.findById(announcementId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông báo"));

        League league = announcement.getLeague();
        if (!league.getManager().getId().equals(managerId)) {
            throw new ForbiddenException("Bạn không có quyền xóa thông báo này");
        }

        leagueAnnouncementRepository.delete(announcement);
    }

    @Override
    @Transactional(readOnly = true)
    public LeagueAnnouncementResponse getAnnouncementById(Integer announcementId) {
        LeagueAnnouncement announcement = leagueAnnouncementRepository.findById(announcementId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông báo"));
        return LeagueAnnouncementResponse.fromEntity(announcement);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeagueAnnouncementResponse> getAnnouncementsByLeagueId(Integer leagueId) {
        if (!leagueRepository.existsById(leagueId)) {
            throw new ResourceNotFoundException("Không tìm thấy giải đấu");
        }

        return leagueAnnouncementRepository.findByLeagueIdOrderByCreatedAtDescIdDesc(leagueId).stream()
                .map(LeagueAnnouncementResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LeagueAnnouncementCommentResponse addComment(Integer announcementId, LeagueAnnouncementCommentRequest request, Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        LeagueAnnouncement announcement = leagueAnnouncementRepository.findById(announcementId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông báo"));

        LeagueAnnouncementComment comment = new LeagueAnnouncementComment();
        comment.setAnnouncement(announcement);
        comment.setUser(user);
        comment.setContent(request.getContent());

        LeagueAnnouncementComment saved = leagueAnnouncementCommentRepository.save(comment);
        return LeagueAnnouncementCommentResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeagueAnnouncementCommentResponse> getCommentsByAnnouncementId(Integer announcementId) {
        if (!leagueAnnouncementRepository.existsById(announcementId)) {
            throw new ResourceNotFoundException("Không tìm thấy thông báo");
        }

        return leagueAnnouncementCommentRepository.findByAnnouncementIdOrderByCreatedAtAsc(announcementId).stream()
                .map(LeagueAnnouncementCommentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteComment(Integer commentId, Integer userId) {
        LeagueAnnouncementComment comment = leagueAnnouncementCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bình luận"));

        boolean isCommentAuthor = comment.getUser().getId().equals(userId);
        boolean isLeagueManager = comment.getAnnouncement().getLeague().getManager().getId().equals(userId);

        if (!isCommentAuthor && !isLeagueManager) {
            throw new ForbiddenException("Bạn không có quyền xóa bình luận này");
        }

        leagueAnnouncementCommentRepository.delete(comment);
    }
}
