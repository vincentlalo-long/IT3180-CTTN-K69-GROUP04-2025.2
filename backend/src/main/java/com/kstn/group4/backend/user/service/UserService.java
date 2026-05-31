package com.kstn.group4.backend.user.service;

import com.kstn.group4.backend.config.security.services.UserPrincipal;
import com.kstn.group4.backend.exception.ForbiddenException;
import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.user.dto.UserResponseDTO;
import com.kstn.group4.backend.user.entity.User;
import com.kstn.group4.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserResponseDTO getCurrentUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ForbiddenException("Bạn chưa được xác thực để truy cập tài nguyên này");
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserPrincipal userPrincipal)) {
            throw new ForbiddenException("Thông tin xác thực không hợp lệ");
        }

        String email = userPrincipal.getEmail();
        if (email == null || email.isBlank()) {
            throw new ForbiddenException("Không thể xác định email từ thông tin xác thực");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy người dùng với email: " + email,
                        "User"
                ));

        return new UserResponseDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getPhoneNumber(),
                user.getAvatarUrl(),
                user.getTeamId(),
                user.getCreatedAt()
        );
    }

    @Transactional
    public UserResponseDTO updateProfile(com.kstn.group4.backend.user.dto.UpdateProfileRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ForbiddenException("Bạn chưa được xác thực để truy cập tài nguyên này");
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserPrincipal userPrincipal)) {
            throw new ForbiddenException("Thông tin xác thực không hợp lệ");
        }

        String email = userPrincipal.getEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy người dùng với email: " + email,
                        "User"
                ));

        if (request.username() != null && !request.username().isBlank()) {
            user.setUsername(request.username());
        }
        if (request.phoneNumber() != null) {
            user.setPhoneNumber(request.phoneNumber());
        }

        userRepository.save(user);

        return new UserResponseDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getPhoneNumber(),
                user.getAvatarUrl(),
                user.getTeamId(),
                user.getCreatedAt()
        );
    }
}
