package com.kstn.group4.backend.league.dto;

import com.kstn.group4.backend.league.entity.League;
import com.kstn.group4.backend.league.enums.LeagueFormat;
import com.kstn.group4.backend.league.enums.LeagueStatus;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class LeagueResponse {
    private Integer id;
    private String name;
    private String description;
    private LeagueFormat format;
    private Integer numberOfTeams;
    private String prize;
    private LeagueStatus status;
    private Integer managerId;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer venueId;
    private String venueName;
    private Integer timeSlotId;
    private String timeSlotLabel;
    private LocalDateTime createdAt;

    public static LeagueResponse fromEntity(League league) {
        LeagueResponse response = new LeagueResponse();
        response.setId(league.getId());
        response.setName(league.getName());
        response.setDescription(league.getDescription());
        response.setFormat(league.getFormat());
        response.setNumberOfTeams(league.getNumberOfTeams());
        response.setPrize(league.getPrize());
        response.setStatus(league.getStatus());
        if (league.getManager() != null) {
            response.setManagerId(league.getManager().getId());
        }
        response.setStartDate(league.getStartDate());
        response.setEndDate(league.getEndDate());
        if (league.getVenue() != null) {
            response.setVenueId(league.getVenue().getId());
            response.setVenueName(league.getVenue().getName());
        }
        if (league.getTimeSlot() != null) {
            response.setTimeSlotId(league.getTimeSlot().getId());
            response.setTimeSlotLabel(league.getTimeSlot().getStartTime() + " - " + league.getTimeSlot().getEndTime());
        }
        response.setCreatedAt(league.getCreatedAt());
        return response;
    }
}
