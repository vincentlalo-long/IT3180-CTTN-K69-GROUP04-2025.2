package com.kstn.group4.backend.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kstn.group4.backend.auth.dto.ForgotPasswordRequest;
import com.kstn.group4.backend.auth.dto.LoginRequest;
import com.kstn.group4.backend.auth.dto.RegisterRequest;
import com.kstn.group4.backend.auth.service.EmailService;
import com.kstn.group4.backend.user.entity.User;
import com.kstn.group4.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AuthControllerIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private EmailService emailService;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(webApplicationContext)
                .build();

        doNothing().when(emailService).sendPasswordResetEmail(anyString(), anyString(), anyString());

        User existingUser = new User();
        existingUser.setUsername("existinguser");
        existingUser.setEmail("existing@example.com");
        existingUser.setPassword(passwordEncoder.encode("password123"));
        existingUser.setRole("PLAYER");
        userRepository.save(existingUser);
    }

    // ===== REGISTER TESTS =====

    @Test
    void register_withValidData_returns201() throws Exception {
        RegisterRequest request = new RegisterRequest("newplayer", "newplayer@example.com", "securePass1", "PLAYER");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Người dùng đã đăng ký thành công")));
    }

    @Test
    void register_withExistingUsername_returns409() throws Exception {
        RegisterRequest request = new RegisterRequest("existinguser", "different@example.com", "password123", "PLAYER");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", is("Username đã tồn tại")));
    }

    @Test
    void register_withExistingEmail_returns409() throws Exception {
        RegisterRequest request = new RegisterRequest("differentuser", "existing@example.com", "password123", "PLAYER");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", is("Email đã được sử dụng")));
    }

    @Test
    void register_withBlankUsername_returns400() throws Exception {
        RegisterRequest request = new RegisterRequest("", "valid@example.com", "password123", "PLAYER");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_withInvalidEmail_returns400() throws Exception {
        RegisterRequest request = new RegisterRequest("validuser", "not-an-email", "password123", "PLAYER");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_withShortPassword_returns201() throws Exception {
        RegisterRequest request = new RegisterRequest("validuser", "valid@example.com", "12", "PLAYER");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)));
    }

    // ===== LOGIN TESTS =====

    @Test
    void login_withValidCredentials_returns200AndJwt() throws Exception {
        LoginRequest request = new LoginRequest("existing@example.com", "password123", null);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", is(notNullValue())))
                .andExpect(jsonPath("$.type", is("Bearer")))
                .andExpect(jsonPath("$.email", is("existing@example.com")));
    }

    @Test
    void login_withInvalidCredentials_returns401() throws Exception {
        LoginRequest request = new LoginRequest("existing@example.com", "wrongpassword", null);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error", is("UNAUTHORIZED")));
    }

    @Test
    void login_withWrongPassword_returns401() throws Exception {
        LoginRequest request = new LoginRequest("existing@example.com", "completelyWrong!", null);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_withNonExistentEmail_returns401() throws Exception {
        LoginRequest request = new LoginRequest("nobody@example.com", "password123", null);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    // ===== FORGOT PASSWORD TESTS =====

    @Test
    void forgotPassword_withValidEmail_returns200() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest("existing@example.com");

        mockMvc.perform(post("/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", containsString("khôi phục mật khẩu")));
    }

    @Test
    void forgotPassword_withNonExistentEmail_returns404() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest("unknown@example.com");

        mockMvc.perform(post("/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", containsString("Không tìm thấy người dùng")));
    }

    // ===== LOGOUT TESTS =====

    @Test
    void logout_returns200() throws Exception {
        mockMvc.perform(post("/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Đăng xuất thành công")));
    }

    // ===== VALIDATION EDGE CASES =====

    @Test
    void register_withMissingFields_returns400() throws Exception {
        String requestJson = "{}";

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_withMissingEmail_returns400() throws Exception {
        String requestJson = "{\"password\": \"password123\"}";

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void forgotPassword_withInvalidEmailFormat_returns400() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest("not-valid-email");

        mockMvc.perform(post("/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
