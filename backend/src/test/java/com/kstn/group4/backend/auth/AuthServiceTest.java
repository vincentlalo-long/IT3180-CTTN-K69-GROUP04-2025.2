package com.kstn.group4.backend.auth;

import com.kstn.group4.backend.auth.dto.AuthResponse;
import com.kstn.group4.backend.auth.dto.RegisterRequest;
import com.kstn.group4.backend.auth.repository.PasswordResetTokenRepository;
import com.kstn.group4.backend.auth.service.AuthService;
import com.kstn.group4.backend.auth.service.EmailService;
import com.kstn.group4.backend.config.security.jwt.JwtTokenProvider;
import com.kstn.group4.backend.exception.ResourceConflictException;
import com.kstn.group4.backend.user.entity.User;
import com.kstn.group4.backend.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    // --- register tests ---

    @Test
    void register_withValidRequest_createsUserAndReturnsSuccess() {
        RegisterRequest request = new RegisterRequest("newuser", "new@example.com", "password123", null);

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(1);
            return user;
        });

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertTrue(response.success());
        assertEquals("Người dùng đã đăng ký thành công", response.message());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_withDefaultRole_setsPLAYER() {
        RegisterRequest request = new RegisterRequest("newuser", "new@example.com", "password123", null);

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            assertEquals("PLAYER", user.getRole());
            user.setId(1);
            return user;
        });

        authService.register(request);

        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_withExplicitRole_setsCorrectRole() {
        RegisterRequest request = new RegisterRequest("newadmin", "admin@example.com", "password123", "ADMIN");

        when(userRepository.existsByUsername("newadmin")).thenReturn(false);
        when(userRepository.existsByEmail("admin@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            assertEquals("ADMIN", user.getRole());
            user.setId(1);
            return user;
        });

        authService.register(request);

        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_withExistingUsername_throwsResourceConflictException() {
        RegisterRequest request = new RegisterRequest("existinguser", "new@example.com", "password123", null);

        when(userRepository.existsByUsername("existinguser")).thenReturn(true);

        ResourceConflictException ex = assertThrows(ResourceConflictException.class,
                () -> authService.register(request));
        assertEquals("Username đã tồn tại", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_withExistingEmail_throwsResourceConflictException() {
        RegisterRequest request = new RegisterRequest("newuser", "existing@example.com", "password123", null);

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        ResourceConflictException ex = assertThrows(ResourceConflictException.class,
                () -> authService.register(request));
        assertEquals("Email đã được sử dụng", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_encodesPasswordBeforeSaving() {
        RegisterRequest request = new RegisterRequest("newuser", "new@example.com", "mypassword", null);

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("mypassword")).thenReturn("$2a$10$encoded");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            assertEquals("$2a$10$encoded", user.getPassword());
            user.setId(1);
            return user;
        });

        authService.register(request);

        verify(passwordEncoder).encode("mypassword");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_withBlankRole_defaultsToPlayer() {
        RegisterRequest request = new RegisterRequest("newuser", "new@example.com", "password123", "  ");

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            assertEquals("PLAYER", user.getRole());
            user.setId(1);
            return user;
        });

        authService.register(request);

        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_setsCorrectFieldsOnUser() {
        RegisterRequest request = new RegisterRequest("testplayer", "player@example.com", "pass123", "PLAYER");

        when(userRepository.existsByUsername("testplayer")).thenReturn(false);
        when(userRepository.existsByEmail("player@example.com")).thenReturn(false);
        when(passwordEncoder.encode("pass123")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            assertEquals("testplayer", user.getUsername());
            assertEquals("player@example.com", user.getEmail());
            assertEquals("encoded", user.getPassword());
            assertEquals("PLAYER", user.getRole());
            user.setId(1);
            return user;
        });

        authService.register(request);

        verify(userRepository).save(any(User.class));
    }
}
