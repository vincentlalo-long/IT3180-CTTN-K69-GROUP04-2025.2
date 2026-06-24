package com.kstn.group4.backend.activitylog.service;

import com.kstn.group4.backend.activitylog.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ActivityLogService {

    /**
     * Logs an activity asynchronously.
     */
    void log(Integer userId, String userName, String actionType, String targetType, String targetId,
             String description, String oldValue, String newValue);

    /**
     * Retrieves all activity logs with pagination (Admin access).
     */
    Page<ActivityLog> getLogs(Pageable pageable);

    // TODO: In the future, add getPlayerLogs(Integer playerId, Pageable pageable) to expose logs to players.
}
