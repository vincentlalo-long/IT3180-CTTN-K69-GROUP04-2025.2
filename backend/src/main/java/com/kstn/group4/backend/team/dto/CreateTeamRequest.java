package com.kstn.group4.backend.team.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateTeamRequest {

    @NotBlank(message = "Tên đội bóng không được để trống")
    private String name;

    private String description;

    private List<String> memberEmails;
}
