package com.kstn.group4.backend.user.controller;

import com.kstn.group4.backend.user.dto.UserResponseDTO;
import com.kstn.group4.backend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('PLAYER','ADMIN')")
    public ResponseEntity<UserResponseDTO> getCurrentUserProfile() {
        return ResponseEntity.ok(userService.getCurrentUserProfile());
    }

    @org.springframework.web.bind.annotation.PatchMapping("/me")
    @PreAuthorize("hasAnyRole('PLAYER','ADMIN')")
    public ResponseEntity<UserResponseDTO> updateProfile(@org.springframework.web.bind.annotation.RequestBody com.kstn.group4.backend.user.dto.UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(request));
    }
}
