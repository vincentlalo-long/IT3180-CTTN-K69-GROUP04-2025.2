package com.kstn.group4.backend.user;

import com.kstn.group4.backend.config.security.services.UserPrincipal;
import com.kstn.group4.backend.exception.ForbiddenException;
import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.user.dto.UpdateProfileRequest;
import com.kstn.group4.backend.user.dto.UserResponseDTO;
import com.kstn.group4.backend.user.entity.User;
import com.kstn.group4.backend.user.repository.UserRepository;
import com.kstn.group4.backend.user.service.UserService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    // --- getCurrentUserProfile tests ---

    @Test
    void getCurrentUserProfile_withValidUser_returnsDTO() {
        Integer userId = 1;
        String email = "test@example.com";
        User user = createUser(userId, email);

        UserPrincipal principal = createPrincipal(userId, email, "PLAYER");
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn(principal);

        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        UserResponseDTO result = userService.getCurrentUserProfile();

        assertNotNull(result);
        assertEquals(userId, result.id());
        assertEquals("testuser", result.username());
        assertEquals(email, result.email());
        assertEquals("PLAYER", result.role());
        assertEquals("0123456789", result.phoneNumber());
        assertEquals(0, BigDecimal.valueOf(50000).compareTo(result.walletBalance()));
    }

    @Test
    void getCurrentUserProfile_withUnauthenticatedUser_throwsForbiddenException() {
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(null);
        SecurityContextHolder.setContext(securityContext);

        assertThrows(ForbiddenException.class, () -> userService.getCurrentUserProfile());
    }

    @Test
    void getCurrentUserProfile_withUnauthenticatedAuth_throwsForbiddenException() {
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(false);

        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);

        assertThrows(ForbiddenException.class, () -> userService.getCurrentUserProfile());
    }

    @Test
    void getCurrentUserProfile_withNonUserPrincipal_throwsForbiddenException() {
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn("notAUserPrincipal");

        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);

        assertThrows(ForbiddenException.class, () -> userService.getCurrentUserProfile());
    }

    @Test
    void getCurrentUserProfile_withNonExistentUser_throwsResourceNotFoundException() {
        String email = "nonexistent@example.com";
        UserPrincipal principal = createPrincipal(1, email, "PLAYER");
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn(principal);

        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.getCurrentUserProfile());
    }

    // --- updateProfile tests ---

    @Test
    void updateProfile_withNewUsernameAndPhone_updatesCorrectly() {
        String email = "test@example.com";
        User user = createUser(1, email);

        UserPrincipal principal = createPrincipal(1, email, "PLAYER");
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn(principal);

        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateProfileRequest request = new UpdateProfileRequest("newusername", "0987654321");
        UserResponseDTO result = userService.updateProfile(request);

        assertNotNull(result);
        assertEquals("newusername", result.username());
        assertEquals("0987654321", result.phoneNumber());
        verify(userRepository).save(user);
    }

    @Test
    void updateProfile_withBlankUsername_keepsOriginal() {
        String email = "test@example.com";
        User user = createUser(1, email);

        UserPrincipal principal = createPrincipal(1, email, "PLAYER");
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn(principal);

        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateProfileRequest request = new UpdateProfileRequest("", "0987654321");
        UserResponseDTO result = userService.updateProfile(request);

        assertNotNull(result);
        assertEquals("testuser", result.username());
        assertEquals("0987654321", result.phoneNumber());
    }

    @Test
    void updateProfile_withNullUsername_keepsOriginal() {
        String email = "test@example.com";
        User user = createUser(1, email);

        UserPrincipal principal = createPrincipal(1, email, "PLAYER");
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn(principal);

        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateProfileRequest request = new UpdateProfileRequest(null, null);
        UserResponseDTO result = userService.updateProfile(request);

        assertNotNull(result);
        assertEquals("testuser", result.username());
        assertEquals("0123456789", result.phoneNumber());
        verify(userRepository).save(user);
    }

    @Test
    void updateProfile_withUnauthenticatedUser_throwsForbiddenException() {
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(null);
        SecurityContextHolder.setContext(securityContext);

        assertThrows(ForbiddenException.class,
                () -> userService.updateProfile(new UpdateProfileRequest("new", "123")));
    }

    // --- Helper methods ---

    private User createUser(Integer id, String email) {
        User user = new User();
        user.setId(id);
        user.setUsername("testuser");
        user.setEmail(email);
        user.setRole("PLAYER");
        user.setPhoneNumber("0123456789");
        user.setAvatarUrl("https://example.com/avatar.jpg");
        user.setTeamId(10L);
        user.setMembershipPoints(100);
        user.setWalletBalance(BigDecimal.valueOf(50000));
        user.setCreatedAt(LocalDateTime.of(2026, 1, 1, 0, 0));
        return user;
    }

    private UserPrincipal createPrincipal(Integer id, String email, String role) {
        return new UserPrincipal(id, email, "testuser", email, "password", role, java.util.List.of());
    }
}
