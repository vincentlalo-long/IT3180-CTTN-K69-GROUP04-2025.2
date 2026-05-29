package com.kstn.group4.backend.match.job;

import com.kstn.group4.backend.match.entity.Match;
import com.kstn.group4.backend.match.enums.MatchStatus;
import com.kstn.group4.backend.match.repository.MatchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class MatchScheduledTasks {

    private final MatchRepository matchRepository;

    @Scheduled(cron = "0 0/15 * * * ?")
    @Transactional
    public void autoCancelMatches() {
        log.info("[MatchScheduledTasks] Starting auto-cancel job for expired OPEN matches...");
        LocalDateTime cancelThreshold = LocalDateTime.now().plusHours(6);

        List<Match> openMatches = matchRepository.findByStatus(MatchStatus.OPEN);
        int cancelCount = 0;

        for (Match match : openMatches) {
            if (match.getMatchTime().isBefore(cancelThreshold)) {
                match.setStatus(MatchStatus.CANCELLED);
                matchRepository.save(match);
                cancelCount++;
                log.info("[MatchScheduledTasks] Cancelled match ID: {} because match time {} is less than 6 hours from now.", 
                        match.getId(), match.getMatchTime());
            }
        }

        log.info("[MatchScheduledTasks] Job completed. Cancelled {} matches.", cancelCount);
    }
}
