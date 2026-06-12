package com.kstn.group4.backend.notification.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TeamInvitationCreatedEvent {
    private final Integer recipientId;
    private final Long teamId;
    private final String teamName;
    private final String captainName;
}
