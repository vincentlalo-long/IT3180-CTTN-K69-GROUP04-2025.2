package com.kstn.group4.backend.service;

import com.kstn.group4.backend.config.security.jwt.JwtTokenProvider;
import com.kstn.group4.backend.config.security.services.UserPrincipal;
import com.kstn.group4.backend.entity.Role;
import com.kstn.group4.backend.entity.User;
import com.kstn.group4.backend.exception.ConflictException;
import com.kstn.group4.backend.exception.ForbiddenOperationException;
import com.kstn.group4.backend.payload.AuthResponse;
import com.kstn.group4.backend.payload.JwtResponse;
import com.kstn.group4.backend.payload.LoginRequest;
import com.kstn.group4.backend.payload.RegisterRequest;
import com.kstn.group4.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new ConflictException("Username đã tồn tại");
        }

        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email đã được sử dụng");
        }

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));

        String normalizedRole = request.role() == null || request.role().isBlank()
                ? Role.PLAYER.name()
                : Role.fromValue(request.role()).name();
        user.setRole(normalizedRole);

        userRepository.save(user);
        return new AuthResponse(true, "Người dùng đã đăng ký thành công");
    }

    @Transactional(readOnly = true)
    public JwtResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        if (request.role() != null && !request.role().isBlank()) {
            String requestedRole = Role.fromValue(request.role()).name();
            if (!requestedRole.equals(userPrincipal.getRole())) {
                throw new ForbiddenOperationException(
                        "Tài khoản không có quyền đăng nhập với vai trò " + requestedRole
                );
            }
        }

        String token = jwtTokenProvider.generateToken(authentication);
        return new JwtResponse(
                token,
                userPrincipal.getAppUsername(),
                userPrincipal.getEmail(),
                userPrincipal.getRole()
        );
    }
}
