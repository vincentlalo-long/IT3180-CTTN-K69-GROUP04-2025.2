package com.kstn.group4.backend.league.service;

import com.kstn.group4.backend.exception.ForbiddenException;
import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.league.dto.*;
import com.kstn.group4.backend.league.entity.League;
import com.kstn.group4.backend.league.enums.LeagueFormat;
import com.kstn.group4.backend.league.enums.LeagueStatus;
import com.kstn.group4.backend.league.repository.LeagueRepository;
import com.kstn.group4.backend.user.entity.User;
import com.kstn.group4.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class LeagueAnnouncementServiceTest {

    @Autowired
    private LeagueAnnouncementService announcementService;

    @Autowired
    private LeagueRepository leagueRepository;

    @Autowired
    private UserRepository userRepository;

    private User manager;
    private User otherUser;
    private League league;

    @BeforeEach
    void setUp() {
        manager = new User();
        manager.setUsername("manager");
        manager.setEmail("manager@test.com");
        manager = userRepository.save(manager);

        otherUser = new User();
        otherUser.setUsername("other");
        otherUser.setEmail("other@test.com");
        otherUser = userRepository.save(otherUser);

        league = new League();
        league.setName("Premier League");
        league.setFormat(LeagueFormat.ROUND_ROBIN);
        league.setNumberOfTeams(4);
        league.setStatus(LeagueStatus.OPENING);
        league.setManager(manager);
        league = leagueRepository.save(league);
    }

    @Test
    void testCreateAnnouncement_Success() {
        LeagueAnnouncementRequest request = new LeagueAnnouncementRequest();
        request.setTitle("Thay doi lich thi dau");
        request.setContent("Chuyen sang 18h ngay mai");

        LeagueAnnouncementResponse response = announcementService.createAnnouncement(league.getId(), request, manager.getId());

        assertThat(response).isNotNull();
        assertThat(response.getId()).isNotNull();
        assertThat(response.getTitle()).isEqualTo("Thay doi lich thi dau");
        assertThat(response.getContent()).isEqualTo("Chuyen sang 18h ngay mai");
        assertThat(response.getLeagueId()).isEqualTo(league.getId());
    }

    @Test
    void testCreateAnnouncement_Forbidden() {
        LeagueAnnouncementRequest request = new LeagueAnnouncementRequest();
        request.setTitle("Lich");
        request.setContent("Moi");

        assertThrows(ForbiddenException.class, () -> 
            announcementService.createAnnouncement(league.getId(), request, otherUser.getId())
        );
    }

    @Test
    void testCreateAnnouncement_LeagueNotFound() {
        LeagueAnnouncementRequest request = new LeagueAnnouncementRequest();
        request.setTitle("Lich");
        request.setContent("Moi");

        assertThrows(ResourceNotFoundException.class, () -> 
            announcementService.createAnnouncement(99999, request, manager.getId())
        );
    }

    @Test
    void testUpdateAnnouncement_Success() {
        LeagueAnnouncementRequest createReq = new LeagueAnnouncementRequest();
        createReq.setTitle("Cu");
        createReq.setContent("Cu content");
        LeagueAnnouncementResponse response = announcementService.createAnnouncement(league.getId(), createReq, manager.getId());

        LeagueAnnouncementRequest updateReq = new LeagueAnnouncementRequest();
        updateReq.setTitle("Moi");
        updateReq.setContent("Moi content");

        LeagueAnnouncementResponse updated = announcementService.updateAnnouncement(response.getId(), updateReq, manager.getId());

        assertThat(updated.getTitle()).isEqualTo("Moi");
        assertThat(updated.getContent()).isEqualTo("Moi content");
    }

    @Test
    void testUpdateAnnouncement_Forbidden() {
        LeagueAnnouncementRequest createReq = new LeagueAnnouncementRequest();
        createReq.setTitle("Cu");
        createReq.setContent("Cu content");
        LeagueAnnouncementResponse response = announcementService.createAnnouncement(league.getId(), createReq, manager.getId());

        LeagueAnnouncementRequest updateReq = new LeagueAnnouncementRequest();
        updateReq.setTitle("Moi");
        updateReq.setContent("Moi content");

        assertThrows(ForbiddenException.class, () -> 
            announcementService.updateAnnouncement(response.getId(), updateReq, otherUser.getId())
        );
    }

    @Test
    void testDeleteAnnouncement_Success() {
        LeagueAnnouncementRequest createReq = new LeagueAnnouncementRequest();
        createReq.setTitle("Cu");
        createReq.setContent("Cu content");
        LeagueAnnouncementResponse response = announcementService.createAnnouncement(league.getId(), createReq, manager.getId());

        announcementService.deleteAnnouncement(response.getId(), manager.getId());

        assertThrows(ResourceNotFoundException.class, () -> 
            announcementService.getAnnouncementById(response.getId())
        );
    }

    @Test
    void testGetAnnouncementsByLeagueId() {
        LeagueAnnouncementRequest req1 = new LeagueAnnouncementRequest();
        req1.setTitle("T1");
        req1.setContent("C1");
        announcementService.createAnnouncement(league.getId(), req1, manager.getId());

        LeagueAnnouncementRequest req2 = new LeagueAnnouncementRequest();
        req2.setTitle("T2");
        req2.setContent("C2");
        announcementService.createAnnouncement(league.getId(), req2, manager.getId());

        List<LeagueAnnouncementResponse> list = announcementService.getAnnouncementsByLeagueId(league.getId());
        assertThat(list).hasSize(2);
        assertThat(list.get(0).getTitle()).isEqualTo("T2"); // newest first
    }

    @Test
    void testComments_Success() {
        LeagueAnnouncementRequest req = new LeagueAnnouncementRequest();
        req.setTitle("T");
        req.setContent("C");
        LeagueAnnouncementResponse ann = announcementService.createAnnouncement(league.getId(), req, manager.getId());

        LeagueAnnouncementCommentRequest commentReq = new LeagueAnnouncementCommentRequest();
        commentReq.setContent("Toi dong y");

        LeagueAnnouncementCommentResponse commentResp = announcementService.addComment(ann.getId(), commentReq, otherUser.getId());
        assertThat(commentResp).isNotNull();
        assertThat(commentResp.getId()).isNotNull();
        assertThat(commentResp.getContent()).isEqualTo("Toi dong y");
        assertThat(commentResp.getUsername()).isEqualTo("other");

        List<LeagueAnnouncementCommentResponse> comments = announcementService.getCommentsByAnnouncementId(ann.getId());
        assertThat(comments).hasSize(1);
        assertThat(comments.get(0).getContent()).isEqualTo("Toi dong y");

        // delete comment by user who made it
        announcementService.deleteComment(commentResp.getId(), otherUser.getId());
        assertThat(announcementService.getCommentsByAnnouncementId(ann.getId())).isEmpty();
    }

    @Test
    void testDeleteComment_Forbidden() {
        LeagueAnnouncementRequest req = new LeagueAnnouncementRequest();
        req.setTitle("T");
        req.setContent("C");
        LeagueAnnouncementResponse ann = announcementService.createAnnouncement(league.getId(), req, manager.getId());

        LeagueAnnouncementCommentRequest commentReq = new LeagueAnnouncementCommentRequest();
        commentReq.setContent("Toi dong y");

        LeagueAnnouncementCommentResponse commentResp = announcementService.addComment(ann.getId(), commentReq, otherUser.getId());

        User thirdUser = new User();
        thirdUser.setUsername("third");
        thirdUser.setEmail("third@test.com");
        thirdUser = userRepository.save(thirdUser);

        final Integer commentId = commentResp.getId();
        final Integer thirdUserId = thirdUser.getId();

        assertThrows(ForbiddenException.class, () -> 
            announcementService.deleteComment(commentId, thirdUserId)
        );
    }

    @Test
    void testDeleteComment_ByLeagueManager_Success() {
        LeagueAnnouncementRequest req = new LeagueAnnouncementRequest();
        req.setTitle("T");
        req.setContent("C");
        LeagueAnnouncementResponse ann = announcementService.createAnnouncement(league.getId(), req, manager.getId());

        LeagueAnnouncementCommentRequest commentReq = new LeagueAnnouncementCommentRequest();
        commentReq.setContent("Toi dong y");

        LeagueAnnouncementCommentResponse commentResp = announcementService.addComment(ann.getId(), commentReq, otherUser.getId());

        // manager deletes comment
        announcementService.deleteComment(commentResp.getId(), manager.getId());
        assertThat(announcementService.getCommentsByAnnouncementId(ann.getId())).isEmpty();
    }
}
