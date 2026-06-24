package com.kstn.group4.backend.activitylog.service;

import com.kstn.group4.backend.activitylog.entity.ActivityLog;
import com.kstn.group4.backend.activitylog.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    @Async
    @Override
    @Transactional
    public void log(Integer userId, String userName, String actionType, String targetType, String targetId,
                    String description, String oldValue, String newValue) {
        try {
            ActivityLog activityLog = ActivityLog.builder()
                    .userId(userId)
                    .userName(userName != null ? userName : "System")
                    .actionType(actionType)
                    .targetType(targetType)
                    .targetId(targetId)
                    .description(description)
                    .oldValue(oldValue)
                    .newValue(newValue)
                    .build();

            activityLogRepository.save(activityLog);
            log.debug("Successfully logged activity asynchronously: {}", description);
        } catch (Exception e) {
            log.error("Failed to log activity asynchronously: {}", e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ActivityLog> getLogs(Pageable pageable) {
        return activityLogRepository.findAllByOrderByIdDesc(pageable);
    }
}
