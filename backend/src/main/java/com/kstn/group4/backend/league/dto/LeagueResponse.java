package com.kstn.group4.backend.league.dto;

import com.kstn.group4.backend.league.entity.League;
import com.kstn.group4.backend.league.enums.LeagueFormat;
import com.kstn.group4.backend.league.enums.LeagueStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class LeagueResponse {
    private Integer id;
    private String name;
    private LeagueFormat format;
    private Integer numberOfTeams;
    private String prize;
    private LeagueStatus status;
    private Integer managerId;
    private LocalDateTime createdAt;

    public static LeagueResponse fromEntity(League league) {
        LeagueResponse response = new LeagueResponse();
        response.setId(league.getId());
        response.setName(league.getName());
        response.setFormat(league.getFormat());
        response.setNumberOfTeams(league.getNumberOfTeams());
        response.setPrize(league.getPrize());
        response.setStatus(league.getStatus());
        if (league.getManager() != null) {
            response.setManagerId(league.getManager().getId());
        }
        response.setCreatedAt(league.getCreatedAt());
        return response;
    }
}
