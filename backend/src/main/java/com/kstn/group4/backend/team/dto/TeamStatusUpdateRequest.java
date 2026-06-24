package com.kstn.group4.backend.team.dto;

import com.kstn.group4.backend.team.enums.TeamStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TeamStatusUpdateRequest {

    @NotNull(message = "Trạng thái không được để trống")
    private TeamStatus status;
}
