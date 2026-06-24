package com.kstn.group4.backend.league.service;

import com.kstn.group4.backend.league.dto.RegistrationResponse;
import com.kstn.group4.backend.league.enums.RegistrationStatus;
import java.util.List;

public interface LeagueRegistrationService {
    RegistrationResponse registerTeam(Integer leagueId, Long teamId, Integer userId);
    List<RegistrationResponse> getRegistrationsByLeague(Integer leagueId);
    RegistrationResponse updateRegistrationStatus(Integer registrationId, RegistrationStatus status, Integer managerId);
    void deleteRegistration(Integer registrationId, Integer userId);
    void finalizeRegistration(Integer leagueId, Integer managerId);
}
