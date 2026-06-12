package com.kstn.group4.backend.notification.event;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MatchScheduleChangedEvent {
    private final Integer matchId;
    private final List<Long> teamIds;
    private final String changeType;
    private final String venueName;
    private final LocalDateTime matchTime;
}
